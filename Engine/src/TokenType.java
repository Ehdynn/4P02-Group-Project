/** Types of Tokens the tokenizer can categorize Tokens as
 *  Specific comment types are for internal use only; those types are marked with comments, and should be converted to COMMENT before tokens are created.
 */
public enum TokenType {
    KEYWORD,
    IDENTIFIER,
    LITERAL,
    OPERATOR,
    PUNCTUATION,
    WHITESPACE,
    COMMENT,
    SINGLE_LINE_COMMENT,        //For internal use by Lexer only. Should be converted to COMMENT before leaving to the rest of the engine
    MULTI_LINE_COMMENT,         //For internal use by Lexer only. Should be converted to COMMENT before leaving to the rest of the engine
    COMMENT_END,                //For internal use by Lexer only. Should be converted to COMMENT before leaving to the rest of the engine
    UNKNOWN
}
