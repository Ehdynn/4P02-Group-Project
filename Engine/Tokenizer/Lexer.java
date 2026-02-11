import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Lexer {
    private String input;
    private int index;
    FiniteStateMachine currentState;

    public Lexer(String input){
        this.input = input;
        this.index = 0;
    }

    public List<Token> tokenize() {
        List<Token> tokens = new ArrayList<>();
        while (index < input.length()) {
            char currentChar = input.charAt(index);

            if (Character.isWhitespace(currentChar)) {
                if(currentChar == '\n' && currentState == FiniteStateMachine.SINGLE_LINE_COMMENT) currentState = FiniteStateMachine.CODE;
                index++;
                continue;
            }

            Token token = nextToken();
            if (token != null) {
                tokens.add(token);
            } else {
                throw new RuntimeException("Unknown character: " + currentChar);
            }
        }

        return tokens;
    }



    private Token nextToken() {
        if (index >= input.length()) {
            return null;
        }

        String[] tokenPatterns = {
                "_|abstract|assert|boolean|break|byte|case|catch|char|class|continue|default|do|double|else|enum|extends|final|finally|float|for|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while|const|goto|strictfp",         // Keywords
                "[a-zA-Z_][a-zA-Z0-9_]*",   // Identifiers
                "\\d+",                     // Literals
                "//[a-zA-Z0-9_]*",          // Single-Line Commments
                "/\\*[a-zA-Z0-9_]*",        // Multi-Line Comments
                "\\*/",                     // Comment End
                "[+-/*=<>!?]",              // Operators
                "[.,;(){}]",                // Punctuation
        };

        TokenType[] tokenTypes = {
                TokenType.KEYWORD,
                TokenType.IDENTIFIER,
                TokenType.LITERAL,
                TokenType.SINGLE_LINE_COMMENT,
                TokenType.MULTI_LINE_COMMENT,
                TokenType.COMMENT_END,
                TokenType.OPERATOR,
                TokenType.PUNCTUATION
        };

        for (int i = 0; i < tokenPatterns.length; i++) {
            Pattern pattern = Pattern.compile("^" + tokenPatterns[i]);
            Matcher matcher = pattern.matcher(input.substring(index));

            if (matcher.find()) {
                String value = matcher.group();
                index += value.length();
                TokenType t = tokenTypes[i];


                if(t == TokenType.SINGLE_LINE_COMMENT) currentState = FiniteStateMachine.SINGLE_LINE_COMMENT;
                if(t == TokenType.MULTI_LINE_COMMENT) currentState = FiniteStateMachine.MULTI_LINE_COMMENT;
                if(t == TokenType.COMMENT_END) currentState = FiniteStateMachine.CODE;
                if(currentState == FiniteStateMachine.SINGLE_LINE_COMMENT || currentState == FiniteStateMachine.MULTI_LINE_COMMENT)  return new Token(TokenType.COMMENT, value);
                return new Token(tokenTypes[i], value);
            }
        }

        return null;
    }

}
