FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

# 1. Copia apenas arquivos de configuração de dependências
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# 2. Faz o download de dependências (essa etapa fará uso do cache se não houver mudanças)
RUN ./mvnw dependency:go-offline -B

# 3. Copia o código da aplicação e empacota
COPY src ./src
RUN ./mvnw package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:InitialRAMPercentage=40.0", \
  "-XX:MaxRAMPercentage=75.0", \
  "-XX:+ExitOnOutOfMemoryError", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
