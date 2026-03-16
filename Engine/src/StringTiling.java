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
    public static List<Sequence> tile(Token[] submission, List<Token[]> database, int tolerance){
        List<Sequence> matches = new ArrayList<>();
        boolean[] marked = new boolean[submission.length];

        for(Token[] comparison: database){
            int numMatches = 1;
            // Iterative loop which finds the largest remaining common sequences
            while(numMatches != 0){
                List<Sequence> subMatches = new ArrayList<>();
                //array for keeping track of sequence starts, so two sequences of the same start and length aren't reused
                List<Integer> matchStarts = new ArrayList<>();
                List<Token> tempTokens = new ArrayList<>();
                int lcs = tolerance;

                for (int i = 0; i < submission.length; i++) {
                    if (marked[i]) continue;

                    for (int j = 0; j < comparison.length; j++) {

                        int n = 0;

                        // Finds n next common tokens
                        while (i + n < submission.length &&
                                j + n < comparison.length &&
                                !marked[i + n] &&
                                submission[i + n].compareTo(comparison[j + n]) == 1) {
                            //if(submission[i + n].compareTo(comparison[j + n]) == 1){
                                //if token has identical type and value, assign full plagiarism value
                                submission[i + n].setPlagiarismValue(1);
                            /* }  else if (submission[i + n].compareTo(comparison[j + n]) == 0){
                                //if token has identical type but different value, assign partial plagiarism value
                                submission[i + n].setPlagiarismValue(0.9);
                            } */
                            tempTokens.add(submission[i + n]);
                            n++;
                        }

                        // Adds largest sequence(s) to matches list
                        if(n > lcs){
                            subMatches.clear();
                            matchStarts.clear();
                            lcs = n;
                            Sequence newSequence = new Sequence(i, n);
                            for(Token t: tempTokens){
                                newSequence.addToken(t);
                            }
                            subMatches.add(newSequence);
                            matchStarts.add(i);
                        } else if(n == lcs && !matchStarts.contains(i)){
                            Sequence newSequence = new Sequence(i, n);
                            for(Token t: tempTokens){
                                newSequence.addToken(t);
                            }
                            subMatches.add(newSequence);
                            matchStarts.add(i);
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
}
