/// Sequences of similar tokens that will be used to calculate the similarity score
public class Sequence {
    private int start;
    private int length;

    /** Sequence Constructor
     *
     * @param start Index of first token in sequence
     * @param len   Length of sequence
     */
    Sequence(int start, int len) {
        this.start = start;
        this.length = len;
    }

    /** First token index
     *
     * @return  the index of the first token as an int
     */
    public int getStart() {
        return start;
    }

    /** Sequence length
     *
     * @return  the length of the sequence as an int
     */
    public int getLength() {
        return length;
    }

    /** Prints the starting index and length of sequence
     *
     * @return  String of starting index and length of sequence
     */
    @Override
    public String toString() {
        return "(Start: " + start + ", length: " + length +")";
    }
}
