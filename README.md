# Hyperledger_Fabric_Full_Setup
This is a Land Acquisition System Project based on Hyperledger Fabric(used golang for chaincode,cli container in docker),Springboot,Postgresql,Nextjs

-----------------------------------------------------------
Land Acquisition Management System using Hyperledger Fabric
This project is a comprehensive, enterprise-grade system designed to digitize and streamline the land acquisition process for government projects. By leveraging Hyperledger Fabric, it creates a transparent, efficient, and immutable ledger for all acquisition-related activities, from initial data entry to final compensation payment.

----------------
Project Overview
The current manual process for land acquisition is often slow, opaque, and prone to errors and malpractices. This project addresses these challenges by providing a centralized digital platform with a professional admin UI, a secure Java Spring Boot backend, and a robust Hyperledger Fabric blockchain network.

------------
Key Features

Immutable Ledger: Every significant action, such as award declarations, compensation payments, and litigation updates, is recorded on an unchangeable blockchain ledger.

Centralized Dashboard: A unified web interface for officials to perform data entry, track the status of land parcels, and view real-time reports.

Real-time Reporting: The system provides instant insights into key metrics, such as the number of properties acquired, beneficiaries paid, and cases under litigation.

Search and Filtering: Powerful search capabilities allow officials to quickly find records by Tehsil, Village, Survey Number, or beneficiary name.

Secure & Scalable: Built with a modern technology stack designed for security, performance, and scalability.

<img width="1024" height="1536" alt="ChatGPT Image Aug 2, 2025, 02_26_13 PM" src="https://github.com/user-attachments/assets/df4b92c1-3399-40ce-b3f5-fbaa898af08e" />

----------------
Technology Stack

Category	                  Technology
Blockchain	                Hyperledger Fabric v2.5, Go (Chaincode), CouchDB
Backend	                    Spring Boot 3, Java 17
Frontend	                  Next.js 14 (App Router), React, TypeScript
UI/Styling	                Tailwind CSS, ShadCN UI
Database	                  PostgreSQL
DevOps	                    Docker, Docker Compose


Divided this project into three parts (fabric-network , backend , frontend).
Divided this project into three parts (fabric-network , backend , frontend).
Divided this project into three parts (fabric-network , backend , frontend).

#------------------------------------- 1st Part --------------------------------------------

fabric-network :

You need to download Hyperledger Fabric Binaries from github ( download it outside from land-acquisition-system folder)

for example make a folder Hyper_Ledger_Lib , inside that folder run this command 

For Apple Silicon (arm64) Macs:

Bash

curl -L "https://github.com/hyperledger/fabric/releases/download/v2.5.0/hyperledger-fabric-darwin-arm64-2.5.0.tar.gz" -o hyperledger-fabric-darwin-arm64-2.5.0.tar.gz

for other OS:

curl -sSLO https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh && chmod +x install-fabric.sh
./install-fabric.sh --fabric-version 2.5.0 --ca-version 1.5.5 --ccenv-version 1.4.9 


then move to the path land-acquisition-system/fabric-network/scripts

1st command : tell the path of your Hyperledger Fabric Binaries(/bin) to your system ex: user/amitaryan/Hyper_Ledger_Lib/bin
              Make sure you are in the fabric-network/scripts then run this export: PATH=/Users/amitaryan/bigfile/bin:$PATH :(set your Hyperledger Fabric Binaries(/bin) 
              path very important and run which configtxgen , if the path is correct it show path)

2nd Command : ./network.sh up
3rd Command : ./network.sh createChannel
4th Command:  ./network.sh deployCC
5th Command:  ./network down ( to turn off )


#------------------------------------- 2nd Part --------------------------------------------

Sprinboot(backend)

Assuming the fabric-network is running.

we need admin_key.pem , cert.pem , connection-gov.json inside land-acquisition-system/backend/src/main/resources/crypto/

go to /land-acquisition-system and run this command
1. cat fabric-network/crypto-config/fabric-ca/gov/ca-cert.pem
2. cat fabric-network/crypto-config/peerOrganizations/gov.land.com/peers/peer0.gov.land.com/tls/ca.crt

Copy the entire output, including the -----BEGIN CERTIFICATE----- and -----END CERTIFICATE----- lines of both command 

and paste it in this file (that is available inside land-acquisition-system/fabric-network/config/connection-profiles/connection-gov.json

file look like this:

{
    "name": "land-acquisition-network-gov",
    "version": "1.0.0",
    "client": {
        "organization": "GovOrg",
        "connection": {
            "timeout": {
                "peer": {
                    "endorser": "300"
                }
            }
        }
    },
    "organizations": {
        "GovOrg": {
            "mspid": "GovOrgMSP",
            "peers": [
                "peer0.gov.land.com"
            ],
            "certificateAuthorities": [
                "ca_gov"
            ]
        }
    },
    "peers": {
        "peer0.gov.land.com": {
            "url": "grpcs://localhost:7051",
            "tlsCACerts": {
                "pem": "PASTE_PEER_TLS_CA_CERT_HERE"                          <-------------------------------------------------------------
            },
            "grpcOptions": {
                "ssl-target-name-override": "peer0.gov.land.com"
            }
        }
    },
    "certificateAuthorities": {
        "ca_gov": {
            "url": "https://localhost:7054",
            "caName": "ca-gov",
            "tlsCACerts": {
                "pem": "PASTE_CA_GOV_CERT_HERE"           <-------------------------------------------------------------
            },
            "httpOptions": {
                "verify": false
            }
        }
    }
}


and after this run these commands from land-acquisition-system folder:
 2. Copy the connection profile we just created
cp fabric-network/config/connection-profiles/connection-gov.json backend/src/main/resources/crypto/

 3. Copy the Admin's signing certificate
cp fabric-network/crypto-config/peerOrganizations/gov.land.com/users/Admin@gov.land.com/msp/signcerts/cert.pem backend/src/main/resources/crypto/

 4. Copy and rename the Admin's private key
cp fabric-network/crypto-config/peerOrganizations/gov.land.com/users/Admin@gov.land.com/msp/keystore/*_sk backend/src/main/resources/crypto/admin_key.pem

and after thin setup your postgresql a/c to application.properties

and run your springboot app


#------------------------------------- 3rd Part --------------------------------------------
frontend 

go to land-acquisition-system/frontend

run npm install
run npm run dev 

#_________________________________________________________________________________


please contact me in case of any doubt on linkedin
