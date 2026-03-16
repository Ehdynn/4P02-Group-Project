import py4j.GatewayServer;

import javax.xml.stream.events.EndElement;
import java.util.LinkedList;
import java.util.List;

public class EntryPoint {
    String pythonData = "test nonsense";
    public String getData() {
        return "Data from Java";
    }

    public String getStringList() {
        List<String> list = new LinkedList<>();
        list.add("Item 1");
        list.add("Item 2");
        list.add("Test test if you know what's good for you machine");
        return list.toString();
    }

    public String getTokens(String code){
        Lexer lexer = new Lexer(code);
        List<Token> tokens = lexer.tokenize();
        String out = tokens.toString();
        System.out.println(out);
        return out;
    }

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
