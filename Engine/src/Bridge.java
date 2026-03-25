/*package whatever //do not write package name here */

import py4j.GatewayServer;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.List;
import org.json.JSONObject;
import org.json.JSONArray;


class Bridge {
    public String Message() { return "Yo mama"; }
    private String pythonData = "";
    FileHandler fileHandler = new FileHandler();


    public static void main(String[] args)
    {
        GatewayServer g = new GatewayServer(new Bridge());
        g.start();
        System.out.println("Gateway Server Started");
    }

    public void sendDataToJava(String data){
        this.pythonData = data;
        System.out.println(pythonData);
    }

    /**Creates a token list from code, and then sends the code to python
     * TEST CODE
     * NOT FOR FINAL RELEASE
     *
     *
    public String Tokenize(String code){
        Lexer lexer = new Lexer(code);
        List<Token> tokens = lexer.tokenize();
        List<Token> copy = lexer.tokenize();
        String out = "";
        for (Token token : tokens) {
            out += token.toString() + " ";
        }
        System.out.println(out);
        return out;
    }*/

    public String[] tokenize(byte[] fileData){
        ArrayList<String> tokenLists = new ArrayList<>();
        try {
            File file = fileHandler.writeBytesToFile(fileData, "temp");
            file = fileHandler.unzipFile(file);
            Set<String> fileNames = fileHandler.listFilesUsingDirectoryStream(file.getPath());

            for(String s: fileNames) {
                String extension = fileHandler.getFileExtension(s);

                if (extension.matches("py|c(pp)?|java")) {

                    Lexer l = new Lexer(fileHandler.getSourceCode(new File(file.getPath() + "/" + s)));
                    tokenLists.add(fileHandler.getTokenListCSV(l.tokenize()));
                }
            }

        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        String[] csvs = new String[tokenLists.size()];
        for (int i = 0; i < csvs.length; i++) csvs[i] = tokenLists.get(i);

        return csvs;
    }

    public String tokenizeCondensed(byte[] fileData){
        String tokenLists = "type, value\n";
        try {
            File file = fileHandler.writeBytesToFile(fileData, "temp");
            file = fileHandler.unzipFile(file);
            Set<String> fileNames = fileHandler.listFilesUsingDirectoryStream(file.getPath());

            for(String s: fileNames) {
                String extension = fileHandler.getFileExtension(s);

                if (extension.matches("py|c(pp)?|java")) {

                    Lexer l = new Lexer(fileHandler.getSourceCode(new File(file.getPath() + "/" + s)));
                    tokenLists += fileHandler.getTokenListCSV(l.tokenize());
                }
            }

        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        return tokenLists;
    }

    public String getComparisonData(String submissionID, String databaseCSVs){
        JSONArray databaseParser = new JSONArray(databaseCSVs);
        FileHandler handler = new FileHandler();
        StringTiling tiling = new StringTiling();
        SimilarityScore score = new SimilarityScore();
        ComparisonEngine comparison = new ComparisonEngine();
        List<Submission> database = new ArrayList<Submission>();
        List<Token> studentTokens = new ArrayList<Token>();
        String studentId = new String();

        for (int i = 0; i < databaseParser.length(); i++) {
            JSONObject obj = databaseParser.getJSONObject(i);

            String id = obj.getString("submission_id");
            String file = obj.getString("csv_bytes");

            byte[] decodedBytes = Base64.getDecoder().decode(file);

            String tokenizedString = tokenizeCondensed(decodedBytes);

            List<Token> tokens = handler.getTokensFromFile(tokenizedString);

            if(submissionID.equals(id)){
                studentTokens = tokens;
                studentId = id;
            } else {
                Submission databaseSubmission = new Submission(tokens, id);
                database.add(databaseSubmission);
            }
        }

        Submission studentSubmission = new Submission(studentTokens, studentId);

        List<Sequence> flaggedSequences = tiling.tile(studentSubmission, database, 5);

        double similarityScore = score.getSimilarityScore(studentTokens, flaggedSequences);

        return comparison.buildComparisonData(studentSubmission, flaggedSequences, similarityScore);
    }
}