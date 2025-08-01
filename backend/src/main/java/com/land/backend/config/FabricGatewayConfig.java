package com.land.backend.config;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.InvalidKeyException;
import java.security.PrivateKey;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;

import org.hyperledger.fabric.gateway.Gateway;
import org.hyperledger.fabric.gateway.Identities;
import org.hyperledger.fabric.gateway.Identity;
import org.hyperledger.fabric.gateway.Wallet;
import org.hyperledger.fabric.gateway.Wallets;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

@Configuration
public class FabricGatewayConfig {

    @Value("${fabric.msp.id}")
    private String mspId;

    @Value("${fabric.connection.profile.path}")
    private String connectionProfilePath;


    @Value("${fabric.user.name}")
    private String userName;

    @Value("${fabric.user.cert.path}")
    private String userCertPath;

    @Value("${fabric.user.key.path}")
    private String userKeyPath;

    @Bean
    public Gateway fabricGateway() throws IOException, CertificateException, InvalidKeyException {
        // 1. Create a wallet to hold identities
        Wallet wallet = Wallets.newInMemoryWallet();

        // 2. Read the user's certificate and private key
        Path certPath = Paths.get(new ClassPathResource(userCertPath).getURI());
        X509Certificate certificate = Identities.readX509Certificate(Files.newBufferedReader(certPath));

        Path keyPath = Paths.get(new ClassPathResource(userKeyPath).getURI());
        PrivateKey privateKey = Identities.readPrivateKey(Files.newBufferedReader(keyPath));

        // 3. Create an identity and put it in the wallet
        Identity identity = Identities.newX509Identity(mspId, certificate, privateKey);
        wallet.put(userName, identity);

        // 4. Build the gateway connection
        Gateway.Builder builder = Gateway.createBuilder();
        builder.identity(wallet, userName)
                .networkConfig(Paths.get(new ClassPathResource(connectionProfilePath).getURI()))
                .discovery(true); // Use discovery to find peers

        return builder.connect();
    }
}