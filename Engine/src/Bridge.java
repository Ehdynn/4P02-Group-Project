/*package whatever //do not write package name here */

import py4j.GatewayServer;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.List;


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
     * @param code
     * @return
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
}