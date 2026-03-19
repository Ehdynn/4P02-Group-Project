from py4j.java_gateway import JavaGateway

gateway = JavaGateway()
msgObjectFromJavaApp = gateway.entry_point
print(msgObjectFromJavaApp.Message())