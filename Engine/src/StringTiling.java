import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Takes in an array of tokens and a list of token arrays, outputs a list containing sequences of identical tokens greater than a certain length.
 *
 *  Based on the Greedy-String-Tiling algorithm described on Louis Tarvin's linked website: <a href="https://louistarvin.uk/projects/plagiarism/">...</a>
 *  Modified to only return the similar sequences of the first submission being compared.
 *  Optimized based on this paper from Micheal J. Wise: <a href="https://www.researchgate.net/profile/Michael_Wise/publication/262763983_String_Similarity_via_Greedy_String_Tiling_and_Running_Karp-Rabin_Matching/links/59f03226aca272a2500141f4/String-Similarity-via-Greedy-String-Tiling-and-Running-Karp-Rabin-Matching.pdf">...</a>
 *
 * @version 1.3 (April 16th, 2026)
 */

public class StringTiling {

    /** Takes in an array of tokens and a list of token arrays, outputs a list containing sequences of identical tokens greater than a certain length.
     *  This variation does not take boilerplate code as a parameter
     *
     * @param current The current submission being analyzed for similarity
     * @param database The database of other submissions being checked against the current submission
     * @param tolerance The minimum length required for a code sequence to be flagged as similar
     * @return a list of flagged sequences
     */
    public List<Sequence> tile(Submission current, List<Submission> database, int tolerance){
        return tile(current, database, tolerance, new boolean[current.getTokens().size()]);
    }

    /** Returns the hash value of the type parameter of a particular token
     *
     * @param t The token to be assigned to a HashMap
     * @return Hash code
     */
    int tokenHash(Token t) {
        return t.getType().hashCode();
    }

    /** Takes in an array of tokens and a list of token arrays, outputs a list containing sequences of identical tokens greater than a certain length.
     *  This variation does take in boilerplate code as a parameter
     *
     * @param current The current submission being analyzed for similarity
     * @param database The database of other submissions being checked against the current submission
     * @param tolerance The minimum length required for a code sequence to be flagged as similar
     * @param ignoredTokens A mask corresponding to where boilerplate code is found in the current submission
     *
     * @return a list of flagged sequences
     */
    public List<Sequence> tile(Submission current, List<Submission> database, int tolerance, boolean[] ignoredTokens){
        List<Token> submission = current.getTokens();
        List<Sequence> matches = new ArrayList<>();
        boolean[] marked = new boolean[submission.size()];

            int numMatches = 1;
            // Iterative loop which finds the largest remaining common sequences
            while(numMatches != 0){
                List<Sequence> subMatches = new ArrayList<>();
                //array for keeping track of sequence starts, so two sequences of the same start and length aren't reused
                int[] matchStarts = new int[submission.size()];
                int matchStartsCounter = 1;

                int lcs = tolerance;

                for(Submission submissions: database){
                    //skips submission if it is the one being analyzed
                    if(current.getId().equals(submissions.getId()))
                        continue;

                    List<Token> comparison = submissions.getTokens();

                    Map<Integer, List<Integer>> index = new HashMap<>();

                    //assigns tokens to hashmaps for faster lookup
                    for (int j = 0; j < comparison.size(); j++) {
                        int h = tokenHash(comparison.get(j));
                        index.computeIfAbsent(h, k -> new ArrayList<>()).add(j);
                    }

                    for (int i = 0; i < submission.size(); i++) {
                        if (marked[i] || isIgnored(ignoredTokens, i)) continue;

                        int h = tokenHash(submission.get(i));
                        List<Integer> candidates = index.get(h);

                        if (candidates == null) continue;

                        for (int j : candidates) {
                            //exits loop early if no point in continuing
                            if (Math.min(submission.size() - i, comparison.size() - j) <= lcs)
                                continue;

                            List<Token> tempTokens = new ArrayList<>();

                            int n = 0;

                            // Finds n next common tokens
                            while (i + n < submission.size() && j + n < comparison.size() &&
                                !marked[i + n] &&
                                !isIgnored(ignoredTokens, i + n) &&
                                submission.get(i + n).compareTo(comparison.get(j + n)) >= 0) {
                                Token copy = submission.get(i + n).copy();
                                if(submission.get(i + n).compareTo(comparison.get(j + n)) == 1){
                                    //if token has identical type and value, assign full plagiarism value
                                    copy.setPlagiarismValue(1);
                                }  else if (submission.get(i + n).compareTo(comparison.get(j + n)) == 0){
                                    //if token has identical type but different value, assign partial plagiarism value
                                    copy.setPlagiarismValue(0.9);
                                }
                                tempTokens.add(copy);
                                n++;
                            }

                            // Adds largest sequence(s) to matches list
                            if(n > lcs){
                                subMatches.clear();
                                //match starts value updated so previous starts become invalid
                                matchStartsCounter++;
                                lcs = n;
                                Sequence newSequence = new Sequence(i, n, submissions.getId(), j);
                                for(Token t: tempTokens){
                                    newSequence.addToken(t);
                                }
                                subMatches.add(newSequence);
                                matchStarts[i] = matchStartsCounter;
                            } else if(n == lcs && matchStarts[i] != matchStartsCounter){
                                Sequence newSequence = new Sequence(i, n, submissions.getId(), j);
                                for(Token t: tempTokens){
                                    newSequence.addToken(t);
                                }
                                subMatches.add(newSequence);
                                matchStarts[i] = matchStartsCounter;
                            }

                        tempTokens.clear();
                    }
                }
            }

                // Marks all matched tokens and adds them to master list
                for(Sequence s: subMatches){
                    boolean overlap = false;
                    for(int k = s.getStart(); k < s.getStart() + s.getLength(); k++){
                        if (marked[k]) {
                            overlap = true;
                            break;
                        }
                    }

                    if(overlap) continue;

                    for(int l = 0; l < s.getLength(); l++){
                        marked[s.getStart() + l] = true;
                    }
                    matches.add(s);
                }

                // Checks number of matches found this iteration, exits loop if 0
                numMatches = subMatches.size();
        }

        return matches;
    }

    /** Takes in two submissions and returns a mask, in the form of a boolean array, of where similar sequences were found
     *  in the first submission. Used to ensure boilerplate code does not factor in to the similarity score of a submission.
     *
     * @param current The current submission being analyzed for similarity
     * @param reference The submission being compared against the current submission
     * @param tolerance The minimum length required for a code sequence to be flagged as similar
     *
     * @return A boolean array of matching tokens
     */
    public boolean[] getMatchedTokenMask(Submission current, Submission reference, int tolerance) {
        List<Token> submission = current.getTokens();
        List<Token> comparison = reference.getTokens();
        boolean[] matched = new boolean[submission.size()];
        if (submission.isEmpty() || comparison.isEmpty()) {
            return matched;
        }

        boolean[] marked = new boolean[submission.size()];
        int numMatches = 1;

        while (numMatches != 0) {
            List<int[]> subMatches = new ArrayList<>();
            List<Integer> matchStarts = new ArrayList<>();
            int lcs = tolerance;

            for (int i = 0; i < submission.size(); i++) {
                if (marked[i]) continue;

                for (int j = 0; j < comparison.size(); j++) {
                    int n = 0;

                    while (i + n < submission.size() &&
                            j + n < comparison.size() &&
                            !marked[i + n] &&
                            submission.get(i + n).compareTo(comparison.get(j + n)) >= 0) {
                        n++;
                    }

                    if (n > lcs) {
                        subMatches.clear();
                        matchStarts.clear();
                        lcs = n;
                        subMatches.add(new int[]{i, n});
                        matchStarts.add(i);
                    } else if (n == lcs && !matchStarts.contains(i)) {
                        subMatches.add(new int[]{i, n});
                        matchStarts.add(i);
                    }

                    //skips ahead to avoid redundant iterations
                    if (lcs > tolerance) {
                        i += lcs - 1;
                    }
                }
            }

            for (int[] match : subMatches) {
                int start = match[0];
                int length = match[1];
                for (int k = 0; k < length; k++) {
                    marked[start + k] = true;
                    matched[start + k] = true;
                }
            }

            numMatches = subMatches.size();
        }

        return matched;
    }

    /** Returns true if a token's index corresponds with an array of tokens to be ignored, returns false if not
     *  or if the array of ignored tokens is null.
     *
     * @param ignoredTokens A boolean array indicating which tokens should be ignored by the tiling algorithm
     * @param index The index of a token within the current submission
     *
     * @return boolean
     */
    private boolean isIgnored(boolean[] ignoredTokens, int index) {
        return ignoredTokens != null && index >= 0 && index < ignoredTokens.length && ignoredTokens[index];
    }
}
