import java.util.ArrayList;
import java.util.List;

///Class for overall submission similarities used to generate reports
public class Similarity {
    private double score;
    private List<Sequence> sequences;

    /** Similarity Constructor
     *
     * @param score Similarity score
     * @param sequences Sequences of tokens that were flagged for plagiarism
     */
    Similarity(double score, List<Sequence> sequences) {
        this.score = score;
        this.sequences = sequences;
    }

    /** Similarity score
     *
     * @return the similarity score as a double
     */
    public double getScore() {
        return score;
    }

    /** Sequence list
     *
     * @return the list of flagged sequences
     */
    public List<Sequence> getSequences() {
        return sequences;
    }
}
