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
        File archive = null;
        File extractedDir = null;
        try {
            archive = fileHandler.writeBytesToFile(fileData, "temp");
            extractedDir = fileHandler.unzipFile(archive);
            List<String> fileNames = new ArrayList<>(fileHandler.listFilesUsingDirectoryStream(extractedDir.getPath()));
            Collections.sort(fileNames);

            for(String s: fileNames) {
                String extension = fileHandler.getFileExtension(s);

                if (extension.matches("py|c(pp)?|java|txt")) {

                    Lexer l = new Lexer(fileHandler.getSourceCode(new File(extractedDir.getPath() + "/" + s)));
                    tokenLists.add(fileHandler.getTokenListCSV(l.tokenize()));
                }
            }

        } catch (IOException e) {
            throw new RuntimeException(e);
        } finally {
            try {
                fileHandler.deleteRecursively(extractedDir);
                fileHandler.deleteRecursively(archive);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }

        String[] csvs = new String[tokenLists.size()];
        for (int i = 0; i < csvs.length; i++) csvs[i] = tokenLists.get(i);

        return csvs;
    }

    public String tokenizeCondensed(byte[] fileData){
        StringBuilder tokenLists = new StringBuilder();
        File archive = null;
        File extractedDir = null;

        try {
            if (looksLikeZip(fileData)) {
                archive = fileHandler.writeBytesToFile(fileData, "temp");
                extractedDir = fileHandler.unzipFile(archive);
                List<String> fileNames = new ArrayList<>(fileHandler.listFilesUsingDirectoryStream(extractedDir.getPath()));
                Collections.sort(fileNames);

                for (String s : fileNames) {
                    String extension = fileHandler.getFileExtension(s);

                    if (extension.matches("py|c(pp)?|java|txt")) {
                        File sourceFile = new File(extractedDir.getPath() + "/" + s);
                        SourceCode sourceCode = fileHandler.getSourceCode(sourceFile);
                        Lexer lexer = new Lexer(sourceCode.sourceCode());
                        tokenLists.append(fileHandler.getTokenListCSV(lexer.tokenize()));
                    }
                }
            } else {
                String sourceText = new String(fileData);
                Lexer lexer = new Lexer(sourceText);
                tokenLists.append(fileHandler.getTokenListCSV(lexer.tokenize()));
            }

        } catch (IOException e) {
            throw new RuntimeException(e);
        } finally {
            try {
                fileHandler.deleteRecursively(extractedDir);
                fileHandler.deleteRecursively(archive);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }

        return tokenLists.toString();
    }

    private boolean looksLikeZip(byte[] fileData) {
        return fileData != null
                && fileData.length >= 4
                && fileData[0] == 'P'
                && fileData[1] == 'K'
                && (fileData[2] == 3 || fileData[2] == 5 || fileData[2] == 7)
                && (fileData[3] == 4 || fileData[3] == 6 || fileData[3] == 8);
    }

    public String getComparisonData(String databaseCSVs, String boilerplate){
        JSONArray databaseParser = new JSONArray(databaseCSVs);
        FileHandler handler = new FileHandler();
        StringTiling tiling = new StringTiling();
        SimilarityScore score = new SimilarityScore();
        ComparisonEngine comparison = new ComparisonEngine();
        List<Submission> database = new ArrayList<Submission>();

        for (int i = 0; i < databaseParser.length(); i++) {
            JSONObject obj = databaseParser.getJSONObject(i);

            String id = obj.getString("submission_id");
            String file = obj.getString("csv_bytes");

            byte[] decodedBytes = Base64.getDecoder().decode(file);

            String tokenizedString = new String(decodedBytes);

            List<Token> tokens = handler.getTokensFromFile(tokenizedString);

            Submission databaseSubmission = new Submission(tokens, id);
            database.add(databaseSubmission);
        }

        JSONArray comparisonData = new JSONArray();

        for(Submission s: database){
            List<Sequence> flaggedSequences = tiling.tile(s, database, 5);

            double similarityScore = score.getSimilarityScore(s.getTokens(), flaggedSequences);

            comparisonData.put(new JSONObject(comparison.buildComparisonData(s, flaggedSequences, similarityScore)));
        }

        return comparisonData.toString();
    }
}
