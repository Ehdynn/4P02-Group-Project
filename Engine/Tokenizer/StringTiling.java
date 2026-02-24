import java.util.ArrayList;
import java.util.List;

public class StringTiling {

    /** Takes in two different lists of tokens, outputs a list containing sequences of identical tokens greater than a certain length.
     *
     *  TODO make compatible with list of submissions rather than single list of tokens
     *  TODO make compatible with plagiarismValue found in token class
     *
     *  Based on the Greedy-String-Tiling algorithm described on Louis Tarvin's linked website: https://louistarvin.uk/projects/plagiarism/
     *  Modified to only return the similar sequences of the first submission being compared.
     *
     * @Version 1.1 (Feb 20th, 2026)
     */
    public static List<Sequence> tile(Token[] A, Token[] B, int minLength){
        List<Sequence> matches = new ArrayList<>();
        int numMatches = 1;
        boolean[] marked = new boolean[A.length];

        // Iterative loop which finds the largest remaining common sequences
        while(numMatches != 0){
            List<Sequence> subMatches = new ArrayList<>();
            //array for keeping track of sequence starts, so two sequences of the same start and length aren't reused
            List<Integer> matchStarts = new ArrayList<>();
            int lcs = minLength;

            for (int i = 0; i < A.length; i++) {
                if (marked[i]) continue;

                for (int j = 0; j < B.length; j++) {

                    int n = 0;

                    // Finds n next common tokens
                    while (i + n < A.length &&
                            j + n < B.length &&
                            !marked[i + n] &&
                            A[i + n].compareTo(B[j + n]) == 1) {
                        n++;
                    }

                    // Adds largest sequence(s) to matches list
                    if(n > lcs){
                        subMatches.clear();
                        matchStarts.clear();
                        lcs = n;
                        subMatches.add(new Sequence(i, n));
                        matchStarts.add(i);
                    } else if(n == lcs && !matchStarts.contains(i)){
                        subMatches.add(new Sequence(i, n));
                        matchStarts.add(i);
                    }
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

        return matches;
    }
}
