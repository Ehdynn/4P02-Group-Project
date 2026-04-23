import py4j.GatewayServer;

import javax.xml.stream.events.EndElement;
import java.util.LinkedList;
import java.util.List;

/**Gateway object for making a connection between python and Java
*    Built on Py4J 
*I believe this to be obsolete, but I fear God to much to remove it*/
public class EntryPoint {
    String pythonData = "test nonsense";

    //test function
    public String getData() {
        return "Data from Java";
    }

    //Another test function
    public String getStringList() {
        List<String> list = new LinkedList<>();
        list.add("Item 1");
        list.add("Item 2");
        list.add("Test test if you know what's good for you machine");
        return list.toString();
    }

    /**Creates a token list from code given from Python
    *
    * @code Code to be tokenized
    * @return token list in the form of a string
    */
    public String getTokens(String code){
        Lexer lexer = new Lexer(code);
        List<Token> tokens = lexer.tokenize();
        String out = tokens.toString();
        System.out.println(out);
        return out;
    }

    //placeholder
    public void getJson(){

    }

    //Test function
    public void sendDataToJava(String data){
        this.pythonData = data;
        System.out.println("From Python: \n" + pythonData);
    }

    public static void main(String[] args) {
        EntryPoint e = new EntryPoint();
        GatewayServer gatewayServer = new GatewayServer(e);
        gatewayServer.start();
        System.out.println("Gateway Server Started");
    }
}
