/**A finite state machine for recording the state the current state the lexer is in
 * Used to handle strings and comments
 */
public enum FiniteStateMachine {
    CODE,
    SINGLE_LINE_COMMENT,
    MULTI_LINE_COMMENT,
    STRING  //TODO Need to Implement usage
}
