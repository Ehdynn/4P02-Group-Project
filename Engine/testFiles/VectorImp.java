/**Implementation of the given Vector Interface
 *
 *
 * @author Steve Mastrokalos 7276900
 */

import java.util.Arrays;
import java.util.Objects;

public class VectorImp implements Vector{

    private double[] vector;    //This shouldn't appear. Let's see

    /**Creates an empty vector
     *
     */
    VectorImp(){vector = new double[0];}  //empty

    /** creates a vector of size  size
     * with elements initialized to D
     * @param size  Size of Vector
     * @param D Value to initialize elements to
     */
    VectorImp(int size, double D){
        if(size < 0){
            throw new IllegalArgumentException("Vector Size Must Be a Positive Integer");
        }
        vector = new double[size];
        for(int i = 0; i < size; i++){
            vector[i] = D;
        }
    }

    /** creates a vector initialized to array D
     *
     * @param D Array of the vector
     */
    VectorImp(double[] D){vector = D.clone();}

    /** Creates a vector initialized to array I
     *
     * @param I array to initialize the vector to
     */
    VectorImp(int[] I){
        vector = new double[I.length];
        for(int i = 0; i < I.length; i++){
            vector[i] = I[i];
        }
    }

    /**Gets a copy of the vector array of Vector V
     *
     * @param V Vector to have elements copied
     * @return  double array of elements
     */
    private double[] getVector(Vector V){
        int VLen = V.getLength();
        double[] vector = new double[VLen];
        for(int i = 0; i < VLen; i++){
            vector[i] = V.getValue(i);
        }
        return vector;
    }

    /** Appends an array of doubles to the end of the vector
     *
     * @param doubleArray   Array to be appended to the end of the vector
     * @return  Updated Vector
     */
    @Override
    public Vector append(double[] doubleArray) {
        int vl = vector.length;
        int dl = doubleArray.length;
        double[] newVector = new double[vl + dl];
        for(int i = 0; i < vl; i++){
            newVector[i] = vector[i];
        }
        for(int i = 0; i < dl; i++){
            newVector[vl+i] = doubleArray[i];
        }
        vector = newVector;
        return this;
    }

    /** Appends an array of ints to the end of the vector
     * Converts intArray to a double array, then calls append(double[] doubleArray)
     *
     * @param intArray  Array to be appended to the end of the vector
     * @return  Updated Vector
     */
    @Override
    public Vector append(int[] intArray) {
        double[] doubleArray = new double[intArray.length];
        for(int i = 0; i < intArray.length; i++){
            doubleArray[i] = (double)intArray[i];
        }
        return this.append(doubleArray);
    }

    /** Appends a vector to the end of this vector
     * Gets the
     *
     * @param V Vector to be appended to the end of the main vector
     * @return  Updated Vector
     */
    @Override
    public Vector append(Vector V) {
        return this.append(getVector(V));
    }

    /** Appends a double to the end of the vector
     *
     * @param aDouble The double to be appended to the end of the vector
     * @return  Updated Vector
     */
    @Override
    public Vector append(double aDouble) {
        double[] newVector = new double[vector.length+1];
        System.arraycopy(vector, 0, newVector, 0, vector.length);
        newVector[vector.length] = aDouble;
        vector = newVector;
        return this;
    }

    /** Creates an identical copy of the Vector but with a new, separate address.
     *  Creates a new VectorImp made from a cloned copy of this Vector's Vector Array
     *
     * @return  Copy of this Vector
     */
    @Override
    public Vector clone() {
        return new VectorImp(this.vector.clone());
    }

    /** Checks if all elements in this Vector and V are the same
     *  Returns false if the vectors are of different lengths
     *  Returns false if the vectors have a different element
     *  Returns true otherwise
     *
     * @param V Vector to be compared to
     * @return  true if all the vectors are the same. false if not
     */
    @Override
    public Boolean equal(Vector V) {
        if(V.getLength() != vector.length) return false;
        for(int i = 0; i < V.getLength(); i++){
            if(!Objects.equals(V.getValue(i), this.getValue(i))) return false;
        }
        return true;
    }

    /** The number of elements in the vector
     *
     * @return  number of elements in the vector
     */
    @Override
    public int getLength() {
        return vector.length;
    }

    /** Gets the double value at point i in the vector
     *
     * @param i position in Vector
     * @return  Double at position i
     */
    @Override
    public Double getValue(int i) {
        return vector[i];
    }


    /** Adds Vector V to this Vector
     *
     * @param V Vector to be added
     * @return  Vector with each element being the sum of the corresponding elements in both vectors
     */
    @Override
    public Vector add(Vector V) {
        if(V.getLength() == 1) return this.add(V.getValue(0));
        if(V.getLength() != this.getLength()) throw new IllegalArgumentException("Vectors must be of the same length");
        else{
            for(int i = 0; i < vector.length; i++){
                vector[i] += V.getValue(i);
            }
        }
        return this;
    }

    /** Adds aDouble to each element of the vector
     *
     * @param aDouble   Value to be added to each element of the vector
     * @return  this vector with each element increased by aDouble
     */
    @Override
    public Vector add(double aDouble) {
        for(int i = 0; i < vector.length; i++){
            vector[i] += aDouble;
        }
        return this;
    }

    /** Subtracts Vector V from this Vector
     * Does this by multiplying all elements of V by -1, and then adding that to this.
     * Calls Vector Mult(Vector V), add(Vector V), and clone()
     *
     * @param V Vector to be subtracted from this
     * @return  Vector with each element being this Vector's elements - Vector V's corresponding element
     */
    @Override
    public Vector sub(Vector V) {
        return this.add(V.clone().Mult(-1));
    }

    /** Subvector between points l and r
     * l and r inclusive
     *
     * @param l left-most element included in the subvector
     * @param r right-most element included in the subvector
     * @return  new subvector between the elements l and r
     */
    @Override
    public Vector subV(int l, int r) {
        double[] subArray = Arrays.copyOfRange(vector, Math.min(l, r), Math.max(l, r)+1);
        return new VectorImp(subArray);
    }

    /** Multiplies every element of this by corresponding element in V
     *  If V is only one element, it is treated as a double
     *  if V is not a single element, and is a different length from this, throws a runtime error
     *
     * @param V Vector to multiply this by
     * @return  Vector Product of this and V
     */
    @Override
    public Vector Mult(Vector V) {
        if(V.getLength() == 1) return Mult(V.getValue(0));
        if(V.getLength() != this.getLength()) throw new IllegalArgumentException("Vectors must be the same length");
        else{
            for(int i = 0; i < vector.length; i++){
                vector[i] *= V.getValue(i);
            }
        }
        return this;
    }

    /** Multiplies every element of the Vector by aDouble
     *
     * @param aDouble   double to multiple each element by
     * @return  Vector of the products of a double and the elements of this Vector
     */
    @Override
    public Vector Mult(double aDouble) {
        for(int i = 0; i < vector.length; i++){
            vector[i] *= aDouble;
        }
        return this;
    }

    /** Normalized vector
     *
     * @return  Normalized Vector
     */
    @Override
    public Vector Normalize() {
        double magnitude = Magnitude();
        for(int i = 0; i < vector.length; i++){
            vector[i] = vector[i]/magnitude;
        }
        return this;
    }

    /**The magnitude of the vector
     * Magnitude is the sqrt of the sum of the squares of each element of the vector
     * used for normalizing the vector
     *
     *
     * @return Magnitude of the vector
     */
    private double Magnitude(){
        double sumOfSquares = 0;
        for (double d : vector) {
            sumOfSquares += d * d;
        }
        return Math.sqrt(sumOfSquares);
    }

    /**Euclidean distance between this Vector and Vector V
     *
     * @param V Vector to compare the distance to
     * @return  Euclidean Distance between the two Vectors
     */
    @Override
    public Double EuclidianDistance(Vector V) {
        if(V.getLength() != this.getLength()) throw new IllegalArgumentException("Vectors must be the same length");
        double sum = 0;
        for(int i = 0; i < V.getLength(); i++){
            double x = this.getValue(i) - V.getValue(i);
            sum += x * x;
        }
        return Math.sqrt(sum);
    }
}
