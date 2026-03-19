/*package whatever //do not write package name here */

import py4j.GatewayServer;
import org.json.JSONObject;
import org.json.JSONArray;
import java.util.*;
import java.util.List;


class Bridge {
    public String Message() { return "Yo mama"; }
    private String pythonData = "";


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
     */
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
    }

}