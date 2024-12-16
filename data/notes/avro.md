# Avro File Format: Notes

## 1. Introduction to Avro

### What is Avro?
Avro is a data serialization system that provides:
- Fast and compact data serialization
- Built-in support for remote procedure calls (RPC)
- Schema-based data format with schema always embedded in files
- Rich data structures
- Easy integration with dynamic languages

### Key Features
- **Schema Embedding**: Every Avro file includes its schema, enabling reads without prior schema knowledge
- **Type Safety**: Supports both primitive types (boolean, int, long) and complex types (maps, arrays, enums)
- **Compact Format**: Efficient binary data format
- **Language Agnostic**: Works across multiple programming languages

## 2. Basic Avro Usage

### Schema Definition
Avro schemas can be defined in JSON format. Example schema for a Car:

```json
{
  "namespace": "datajek.io.avro",
  "type": "record",
  "name": "Car",
  "fields": [
    {
      "name": "make",
      "type": "string"
    },
    {
      "name": "model",
      "type": ["string", "null"]
    },
    {
      "name": "year",
      "type": ["int", "null"]
    },
    {
      "name": "horsepower",
      "type": ["int", "null"]
    }
  ]
}
```

### Working with Generic Records
```java
// Creating a record
Schema schema = new Schema.Parser().parse(new File("car.avsc"));
GenericRecord car = new GenericData.Record(schema);
car.put("make", "Porsche");
car.put("model", "911");
car.put("year", 2019);
car.put("horsepower", 443);
```

## 3. Code Generation

### Benefits of Code Generation
- Type safety at compile time
- No need for explicit casting
- Better IDE support
- Reduced runtime errors

### Generation Methods
1. **Using Avro Tools**:
```bash
java -jar avro-tools-1.9.1.jar compile schema car.avsc .
```

2. **Using Maven Plugin**:
```xml
<plugin>
    <groupId>org.apache.avro</groupId>
    <artifactId>avro-maven-plugin</artifactId>
    <version>1.9.1</version>
</plugin>
```

### Using Generated Classes
```java
// Creating a car using generated class
Car car = new Car();
car.setMake("Porsche");
car.setModel("911");
car.setYear(2019);
car.setHorsepower(443);
```

## 4. Avro IDL (Interface Definition Language)

### Introduction to IDL
- Higher-level language for schema definition
- More readable than JSON
- Similar syntax to Java/C++
- Compiles to Avro Protocol format

### Example IDL
```idl
@namespace("io.datajek")
protocol CarProtocol {
  record Car {
    string make;
    string model;
    int year;
    int horsepower;
  }
  
  string carToString(Car car);
}
```

### IDL Workflow
1. Write `.avdl` file
2. Compile to `.avpr` (protocol file)
3. Generate code from protocol
4. Implement generated interfaces

### Compilation Commands
```bash
# Convert IDL to Protocol
java -jar avro-tools-1.9.1.jar idl carProtocol.avdl carProtocol.avpr

# Generate Java classes
java -jar avro-tools-1.9.1.jar compile protocol carProtocol.avpr .

# Generate schema
java -jar avro-tools-1.9.1.jar idl2schemata carProtocol.avdl
```

## 5. Remote Procedure Calls (RPC)

### RPC Architecture
- Based on the Proxy Pattern
- Enables remote method invocation
- Supports client-server communication

### Components
1. **Proxy**: Client-side representative of remote object
2. **Subject**: Common interface for Proxy and Real Subject
3. **Real Subject**: Server-side implementation

### Implementation Steps
1. Define protocol in IDL
2. Generate interfaces and classes
3. Implement server-side logic
4. Create client proxy
5. Make remote calls

### Example RPC Setup
```java
// Server setup
Server server = new NettyServer(
    new SpecificResponder(CarProtocol.class, new CarProtocolImpl()),
    new InetSocketAddress(65111));
server.start();

// Client setup
CarProtocol proxy = SpecificRequestor.getClient(
    CarProtocol.class,
    new NettyTransceiver(new InetSocketAddress(65111)));

// Make remote call
String result = proxy.carToString(car);
```

## 6. Best Practices

### Schema Evolution
- Make all fields optional when possible
- Provide default values for new fields
- Avoid removing or renaming fields
- Use unions for flexibility

### Performance Optimization
- Use code generation for performance-critical applications
- Enable compression for large datasets
- Reuse Schema and DatumReader/DatumWriter objects
- Consider using specific vs. generic records based on use case

### Development Workflow
1. Start with IDL for complex schemas
2. Use JSON schema for simple cases
3. Generate code early in development
4. Implement comprehensive tests
5. Document schema changes

## 7. Common Use Cases

### Data Serialization
- Long-term data storage
- Message queue payloads
- Cache serialization
- File-based data exchange

### RPC Systems
- Microservice communication
- Distributed computing
- Service integration
- API implementation

## 8. Troubleshooting

### Common Issues
1. Schema compatibility errors
2. Runtime type mismatches
3. Performance bottlenecks
4. Network connectivity issues

### Solutions
- Validate schemas before deployment
- Use schema evolution best practices
- Monitor RPC performance
- Implement proper error handling
- Keep tools and libraries updated

## Conclusion

Avro provides a robust system for data serialization and RPC communication. By understanding and following these concepts and best practices, you can effectively use Avro in your applications. The combination of schema evolution, code generation, and RPC capabilities makes it a powerful choice for modern distributed systems.