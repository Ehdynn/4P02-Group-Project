from py4j.java_gateway import JavaGateway

# Connect to the Java Gateway Server (default port is 25333)
gateway = JavaGateway()

# Access the entry point object exposed by the Java application
entry_point = gateway.entry_point

# Call a method on the Java object and get the return value
java_string_data = entry_point.getData()
print(f"Received string data: {java_string_data}")

#Sends data to Java
code_to_send = """public class HelloWorld {

    // Your program begins with a call to main()
    public static void main(String args[])
    {
        // Prints "Hello, World" to the terminal window.
        System.out.println("Hello, World");
    }
}"""
gateway.sendDataToJava(code_to_send)
java_tokens = entry_point.getTokens(code_to_send)
print(f"Received tokens: {str(java_tokens)}")


