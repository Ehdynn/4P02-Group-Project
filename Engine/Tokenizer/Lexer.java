import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Takes in code in the form of a String, outputs a list of Tokens that catagorize and order each piece of code.
 *  These tokens will be used for comparisons for plagiarism detection.
 *  These tokens will be used to reconstruct the report later.
 *
 *  TODO add Python and C support
 *  TODO add String support
 *
 *  Based on Enzo Jade's Tokenizer from the linked tutorial: https://medium.com/@enzojade62/step-by-step-building-a-lexer-in-java-for-tokenizing-source-code-ac4f1d91326f
 *  Modified to support comments, Strings, and non-Java languages.
 *
 * @Version 1.0 (Feb 11th, 2026)
 */
public class Lexer {
    private String input;
    private int index;
    FiniteStateMachine currentState;

    /** Creates a Lexer (also known as a tokenizer,) that can be used to tokenize the given String input
     *
     * @param input Code to be tokenized
     */
    public Lexer(String input){
        this.input = input;
        this.index = 0;
    }

    /** Creates the list of tokens from the given text from construction
     *  TODO I'm pretty sure a double whitespace breaks it. That needs to be fixed at some point.
     *
     * @return  List of Tokens
     */
    public List<Token> tokenize() {
        List<Token> tokens = new ArrayList<>();
        while (index < input.length()) {
            char currentChar = input.charAt(index);

            //Handles whitespaces, ignoring them and ending single line comments if relevant.
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


    /** Creates the next Token beginning at the current index
     *  Compares the current string to the regular expressions representing the different types of Tokens
     *  TODO Need to make this more resilient. Currently handles errors poorly
     *
     * @return  Null if something fails,
     */
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
