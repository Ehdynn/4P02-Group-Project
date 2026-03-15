import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Takes in code in the form of a String, outputs a list of Tokens that categorizes and orders each piece of code.
 *  These tokens will be used for comparisons for plagiarism detection.
 *  These tokens will be used to reconstruct the report later.
 *
 *
 *  Based on Enzo Jade's Tokenizer from the linked tutorial: https://medium.com/@enzojade62/step-by-step-building-a-lexer-in-java-for-tokenizing-source-code-ac4f1d91326f
 *  Modified to support comments, Strings, and non-Java languages
 *  Modified to make Keywords not break the lexer if not the first keyword in a list
 *
 * @Version 1.2.1 (March 8th, 2026)
 */
public class Lexer {
    private String input;
    private final Language language;
    private int index;
    FiniteStateMachine currentState;
    private static final String JAVA_KEYWORDS = "_|abstract|assert|boolean|break|byte|case|catch|char|class|continue|default|do(uble)?|else|enum|extends|final(ly)?|float|for|if|implements|import|instanceof|int(erface)?|long|native|new|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while|const|goto|strictfp";
    private static final String C_KEYWORDS = "auto|break|case|char|const|continue|default|do(uble)?|else|enum|extern|float|for|goto|if|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|union|unsigned|void|volatile|while|inline|restrict|_(Bool|Complex|Imaginary_Alignas|Alignof|Atomic|Generic|NoReturn|Static_assert|Thread_local|BitInt|Decimal(32|64|128))|align(as|of)|bool|constexpr|false|nullptr|static_assert|thread_local|true|typeof(_unequal)?";
    private static final String PYTHON_KEYWORDS = "if|for|while|try|raise|class|def|with|break|continue|del|pass|assert|yield|return|import|from|match|case|bool|byte(array|s)|complex|dict|types|EllipsisType|float|frozenset|int|list|NoneType|NotImplementedType|range|set|str|tuple";


    public Lexer(String input){
        this.input = input;
        this.language = Language.Java;
        this.index = 0;
    }

    /** Creates a Lexer (also known as a tokenizer) that can be used to tokenize the given String input
     *
     * @param input Code to be tokenized
     * @param language Language of the code
     */
    public Lexer(String input, Language language){
        this.input = input;
        this.language = language;
        this.index = 0;
    }

    /** Creates the list of tokens from the given text from construction
     *
     * @return  List of Tokens
     */
    public List<Token> tokenize() {
        List<Token> tokens = new ArrayList<>();

        input = removeComments(input, language);

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

        correctStrings(tokens);
        correctCharacters(tokens);
        condenseStringTokens(tokens);
        correctKeywords(tokens);
        return tokens;
    }

    /** Creates the next Token beginning at the current index
     *  Compares the current string to the regular expressions representing the different types of Tokens
     *  Does not identify strings, chars or keywords. Those must be done independently, later with the correctKeywords,
     *  correctCharacters, and correctKeywords functions
     *  TODO Need to make this more resilient. Currently handles errors poorly
     *
     * @return  null if something fails, token made from next token of code otherwise
     */
    private Token nextToken() {
        if (index >= input.length()) {
            return null;
        }

        String keywords;
        switch (language){
            case Java -> keywords = JAVA_KEYWORDS;
            case C -> keywords = C_KEYWORDS;
            case Python -> keywords = PYTHON_KEYWORDS;
            default -> keywords = "";
        }

        String[] tokenPatterns = {
                "[a-zA-Z_][a-zA-Z0-9_]*",   // Identifiers
                "\\d+",                     // Literals
                "//[a-zA-Z0-9_]*",          // Single-Line Comments
                "/\\*[a-zA-Z0-9_]*",        // Multi-Line Comments
                "\\*/",                     // Comment End
                "[+/*=<>!?&|^~:%@-]",       // Operators
                "[.,;()\\[\\]{}\"']",             // Punctuation
        };

        TokenType[] tokenTypes = {
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

                /** Removed, as comments are now handled earlier in the process
                 * Commented out in case needed in the future
                 *
                if(t == TokenType.SINGLE_LINE_COMMENT) currentState = FiniteStateMachine.SINGLE_LINE_COMMENT;
                if(t == TokenType.MULTI_LINE_COMMENT) currentState = FiniteStateMachine.MULTI_LINE_COMMENT;
                if(t == TokenType.COMMENT_END) currentState = FiniteStateMachine.CODE;
                if(currentState == FiniteStateMachine.SINGLE_LINE_COMMENT || currentState == FiniteStateMachine.MULTI_LINE_COMMENT)  return new Token(TokenType.COMMENT, value);
                */

                return new Token(tokenTypes[i], value);
            }
        }

        return null;
    }

    /**Searches for and removes all comments
     * Finds them using Java's replace all function
     *
     * Single line java/c comments are defined by the regular expression "// .* \n".
     * Multiline java/c comments are defined by the regular expression "/ \\* .* \\* /".
     *
     * Single line python comments are defined by the regular expression "# .* \n".
     * There are no official python multiline comments. multiline quotes however function as comments.
     * Multiline strings functioning as comments are defined by the regex "\n \t* """ .* """ ".
     *
     * @param string    String to remove comments from
     * @param l         language being processed
     * @return  String with all comments removed.
     */
    private String removeComments(String string, Language l){
        String s = string;
        if(l == Language.C || l == Language.Java) {
            s = s.replaceAll("/\\*.*\\*/", ""); //Deletes multiline comments
            s = s.replaceAll("//.*\n", "");     //Deletes single line comments
        } else if (l == Language.Python) {
            s = s.replaceAll("\n\t*\"\"\".*\"\"\"", "\n");    //Deletes standalone multiline quotes
            s = s.replaceAll("#.*\\n", ""); //Deletes single line comments
        }
        return s;
    }

    /**Rewrites the type of all tokens between quote tokens as literals, as they are part of strings.
     *
     * @param tokens    List of tokens to modify
     * @return  updated List
     */
    private List<Token> correctStrings(List<Token> tokens){
        int l = -1; //left/starting index
        int r = -1; //right/final index
        int counter = 0;

        for(Token token : tokens){
            if(token.getValue().equals("\"")){
                if(l == -1) l = counter;
                else{
                    r = counter;
                    for(int i = l + 1; i < r; i++) tokens.get(i).updateType(TokenType.LITERAL);
                    l = -1;
                    r = -1;
                }
            }

            counter++;
        }
        return tokens;
    }

    /**Rewrites the type of any tokens between single quote tokens as literals, as they are character values.
     * Will only update if a single token is nestled between the quotes.
     *
     * @param tokens    List of tokens to modify
     * @return  updated List
     */
    private List<Token> correctCharacters(List<Token> tokens){
        int l = -1; //left/starting index
        int r = -1; //right/final index
        int counter = 0;

        for(Token token : tokens){
            if(token.getValue().equals("'") && token.getType() == TokenType.PUNCTUATION){
                if(l == -1) l = counter;
                else{
                    r = counter;
                    if(r-l == 2) {
                        tokens.get(l + 1).updateType(TokenType.LITERAL);
                        l = -1;
                    }else l = r;
                    r = -1;
                }
            }

            counter++;
        }
        return tokens;
    }

    /**Rewrites the type of any tokens that fit within the requirements to be a keyword token.
     * The token must not be part of a string token, and must fit within the language appropriate keyword regex.
     * Also identifies and corrects any occurrences of null in C and Java, and converts said tokens into Literals.
     *
     * @param tokens    List of tokens to modify
     * @return  updated List
     */
    private List<Token> correctKeywords(List<Token> tokens){
        String keywords;
        switch (language){
            case Java -> keywords = JAVA_KEYWORDS;
            case C -> keywords = C_KEYWORDS;
            case Python -> keywords = PYTHON_KEYWORDS;
            default -> keywords = "";
        }

        Pattern pattern = Pattern.compile("^" + keywords);


        for(Token token : tokens){
            if(token.getType() == TokenType.IDENTIFIER){
                String s = token.getValue();
                if(s.matches(keywords))token.updateType(TokenType.KEYWORD);
                else if (s.equals("null") && (language == Language.Java || language == Language.C)) token.updateType(TokenType.LITERAL);
            }

        }
        return tokens;
    }

    /**Replaces all series of string tokens with and individual token representing all tokens
     *
     * @param tokens    List of tokens to be modified
     * @return  Modified tokens
     */
    private List<Token> condenseStringTokens(List<Token> tokens){
        List<ArrayList<Token>> StringTokens = new ArrayList<>();
        int l = -1;
        int r = -1;

        for(int i = 0; i < tokens.size(); i++){
            Token token = tokens.get(i);
            if(token.getValue().equals("\"")){
                if(l == -1) l = i;
                else{
                    r = i;
                    ArrayList<Token> tokensToUpdate = new ArrayList<>();
                    for(int j = l + 1; j < r; j++){
                        tokensToUpdate.add(tokens.get(j));
                    }
                    StringTokens.add(tokensToUpdate);
                    l = -1;
                    r = -1;
                }
            }
        }

        for(ArrayList<Token> list : StringTokens){
            String tokenValue = "";
            int index = tokens.indexOf(list.getFirst());
            for(int i = 0; i < list.size(); i++){
                Token token = list.get(i);
                tokens.remove(token);
                tokenValue += token.getValue();
                if(i < list.size() - 1) tokenValue += " ";
            }
            Token t = new Token(TokenType.LITERAL, tokenValue);
            tokens.add(index, t);
        }

        return tokens;
    }
}
