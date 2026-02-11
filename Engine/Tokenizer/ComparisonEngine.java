import java.util.List;

import static java.lang.Math.min;

public class ComparisonEngine {
    ComparisonEngine(){}
    public double compare(String a, String b){
        List<Token> tokensA = new Lexer(a).tokenize();
        List<Token> tokensB = new Lexer(b).tokenize();
        int plagiarized = 0;

        for (int i = 0; i < min(tokensA.size(), tokensB.size()); i++) {
            plagiarized += tokensA.get(i).compareTo(tokensB.get(i));
        }
        return plagiarized;
    }
}
