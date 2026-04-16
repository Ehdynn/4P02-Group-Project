import java.util.ArrayList;
import java.util.List;

public class StringTiling {

    /** Takes in an array of tokens and a list of token arrays, outputs a list containing sequences of identical tokens greater than a certain length.
     *
     *  @ TODO fix plagiarism scores being overwritten
     *
     *  Based on the Greedy-String-Tiling algorithm described on Louis Tarvin's linked website: https://louistarvin.uk/projects/plagiarism/
     *  Modified to only return the similar sequences of the first submission being compared.
     *
     * @Version 1.2 (Mar 12th, 2026)
     */
    public List<Sequence> tile(Submission current, List<Submission> database, int tolerance){
        return tile(current, database, tolerance, new boolean[current.getTokens().size()]);
    }

    public List<Sequence> tile(Submission current, List<Submission> database, int tolerance, boolean[] ignoredTokens){
        List<Token> submission = current.getTokens();
        List<Sequence> matches = new ArrayList<>();
        boolean[] marked = new boolean[submission.size()];

        for(Submission submissions: database){
            //skips submission if it is the one being analyzed
            if(current.getId().equals(submissions.getId()))
                continue;

            List<Token> comparison = submissions.getTokens();

            int numMatches = 1;
            // Iterative loop which finds the largest remaining common sequences
            while(numMatches != 0){
                List<Sequence> subMatches = new ArrayList<>();
                //array for keeping track of sequence starts, so two sequences of the same start and length aren't reused
                List<Integer> matchStarts = new ArrayList<>();

                int lcs = tolerance;

                    for (int i = 0; i < submission.size(); i++) {
                        if (marked[i] || isIgnored(ignoredTokens, i)) continue;

                        for (int j = 0; j < comparison.size(); j++) {
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
                            matchStarts.clear();
                            lcs = n;
                            Sequence newSequence = new Sequence(i, n, submissions.getId(), j);
                            for(Token t: tempTokens){
                                newSequence.addToken(t);
                            }
                            subMatches.add(newSequence);
                            matchStarts.add(i);
                        } else if(n == lcs && !matchStarts.contains(i)){
                            Sequence newSequence = new Sequence(i, n, submissions.getId(), j);
                            for(Token t: tempTokens){
                                newSequence.addToken(t);
                            }
                            subMatches.add(newSequence);
                            matchStarts.add(i);
                        }

                        //skips ahead to avoid redundant iterations
                        if (lcs > tolerance) {
                            i += lcs - 1;
                        }

                        tempTokens.clear();
                    }
                }

                // Marks all matched tokens and adds them to master list
                for(Sequence s: subMatches){
                    for(int k = 0; k < s.getLength(); k++){
                        marked[s.getStart() + k] = true;
                    }
                    matches.add(s);
                }

                // Checks number of matches found this iteration, exits loop if 0
                numMatches = subMatches.size();
            }
        }

        return matches;
    }

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

    private boolean isIgnored(boolean[] ignoredTokens, int index) {
        return ignoredTokens != null && index >= 0 && index < ignoredTokens.length && ignoredTokens[index];
    }
}
