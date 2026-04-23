import py4j.GatewayServer;

import javax.xml.stream.events.EndElement;
import java.util.LinkedList;
import java.util.List;

/**Gateway object for making a connection between python and Java
*    Built on Py4J 
*I believe this to be obsolete, but I fear God too much to remove it*/
public class EntryPoint {

    /**Creates a token list from code given from Python
    *
    * @param code Code to be tokenized
    * @return token list in the form of a string
    */
    public String getTokens(String code){
        Lexer lexer = new Lexer(code);
        List<Token> tokens = lexer.tokenize();
        String out = tokens.toString();
        System.out.println(out);
        return out;
    }

    public static void main(String[] args) {
        EntryPoint e = new EntryPoint();
        GatewayServer gatewayServer = new GatewayServer(e);
        gatewayServer.start();
        System.out.println("Gateway Server Started");
    }
}
