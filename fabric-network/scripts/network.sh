#!/bin/bash
# SCRIPT VERSION: GUARANTEED-FINAL

set -e
set -x

# --- Environment Variables ---
ROOT_DIR=${PWD}/..
CRYPTO_DIR=${ROOT_DIR}/crypto-config
export FABRIC_CFG_PATH=${ROOT_DIR}/config

# This function tears down the entire network
function down() {
  echo "--- Tearing down the network ---"
  docker compose -f ../docker/docker-compose-ca.yaml -f ../docker/docker-compose-couchdb.yaml -f ../docker/docker-compose-net.yaml down --volumes --remove-orphans
  echo "--- Cleaning up crypto and channel artifacts ---"
  rm -rf ${ROOT_DIR}/crypto-config ${ROOT_DIR}/channel-artifacts ${ROOT_DIR}/scripts/landcc.tar.gz
  echo "✅ Network is down."
}

# This function generates all the certificates and the genesis block
function createCrypto() {
  if [ -d "${CRYPTO_DIR}" ]; then
    echo "Found old crypto material, tearing down network first."
    down
  fi
  
  mkdir -p ${ROOT_DIR}/channel-artifacts
  
  echo "--- Starting CAs ---"
  docker compose -f ../docker/docker-compose-ca.yaml up -d
  echo "Waiting for CA services to be ready..."
  sleep 5
  
  echo "--- Generating Crypto Material for Peer Orgs ---"
  createOrgs
  echo "--- Generating Crypto Material for Orderer ---"
  createOrderer
  
  echo "--- Generating Genesis Block ---"
  configtxgen -profile TwoOrgsOrdererGenesis -channelID system-channel -outputBlock ${ROOT_DIR}/channel-artifacts/genesis.block
  
  docker compose -f ../docker/docker-compose-ca.yaml down
  echo "✅ All certificates and genesis block generated."
}

# This function brings up the network nodes AFTER crypto has been created
function up() {
  echo "--- Starting Network Nodes (Peers, Orderer, Databases, CLI) ---"
  docker compose -f ../docker/docker-compose-couchdb.yaml -f ../docker/docker-compose-net.yaml up -d
  echo "Waiting for network to settle..."
  sleep 10
  echo "✅ Network is up."
  docker ps
}

function createOrgs() {
  echo "--- Enrolling Identities & Creating MSPs for Peer Orgs ---"
  
  # --- Create GovOrg ---
  echo "--- Creating GovOrg ---"
  export FABRIC_CA_CLIENT_HOME=${CRYPTO_DIR}/peerOrganizations/gov.land.com/
  local CA_CERT_PATH=${CRYPTO_DIR}/fabric-ca/gov/ca-cert.pem

  fabric-ca-client enroll -u https://admin:adminpw@localhost:7054 --caname ca-gov --tls.certfiles $CA_CERT_PATH
  fabric-ca-client register --caname ca-gov --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles $CA_CERT_PATH
  fabric-ca-client register --caname ca-gov --id.name Admin@gov.land.com --id.secret adminpw --id.type admin --tls.certfiles $CA_CERT_PATH
  
  local PEER_MSP_DIR=${CRYPTO_DIR}/peerOrganizations/gov.land.com/peers/peer0.gov.land.com/msp
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:7054 --caname ca-gov -M $PEER_MSP_DIR --tls.certfiles $CA_CERT_PATH
  cp "${ROOT_DIR}/config/config.yaml" "${PEER_MSP_DIR}/config.yaml"

  local PEER_TLS_DIR=${CRYPTO_DIR}/peerOrganizations/gov.land.com/peers/peer0.gov.land.com/tls
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:7054 --caname ca-gov -M $PEER_TLS_DIR --enrollment.profile tls --csr.hosts peer0.gov.land.com --csr.hosts localhost --tls.certfiles $CA_CERT_PATH
  cp $PEER_TLS_DIR/tlscacerts/* $PEER_TLS_DIR/ca.crt && cp $PEER_TLS_DIR/signcerts/* $PEER_TLS_DIR/server.crt && cp $PEER_TLS_DIR/keystore/* $PEER_TLS_DIR/server.key

  local ADMIN_MSP_DIR=${CRYPTO_DIR}/peerOrganizations/gov.land.com/users/Admin@gov.land.com/msp
  fabric-ca-client enroll -u https://Admin@gov.land.com:adminpw@localhost:7054 --caname ca-gov -M $ADMIN_MSP_DIR --tls.certfiles $CA_CERT_PATH
  cp "${ROOT_DIR}/config/config.yaml" "${ADMIN_MSP_DIR}/config.yaml"
  
  local ORG_MSP_DIR=${CRYPTO_DIR}/peerOrganizations/gov.land.com/msp
  mkdir -p $ORG_MSP_DIR/admincerts $ORG_MSP_DIR/cacerts $ORG_MSP_DIR/tlscacerts
  cp $PEER_TLS_DIR/ca.crt $ORG_MSP_DIR/cacerts/ca.crt
  cp $PEER_TLS_DIR/ca.crt $ORG_MSP_DIR/tlscacerts/tlsca.crt
  cp $ADMIN_MSP_DIR/signcerts/cert.pem $ORG_MSP_DIR/admincerts/cert.pem
  cp "${ROOT_DIR}/config/config.yaml" "${ORG_MSP_DIR}/config.yaml"

  # --- Create CitizenOrg ---
  echo "--- Creating CitizenOrg ---"
  export FABRIC_CA_CLIENT_HOME=${CRYPTO_DIR}/peerOrganizations/citizen.land.com/
  local CA_CERT_PATH_CITIZEN=${CRYPTO_DIR}/fabric-ca/citizen/ca-cert.pem
  
  fabric-ca-client enroll -u https://admin:adminpw@localhost:8054 --caname ca-citizen --tls.certfiles $CA_CERT_PATH_CITIZEN
  fabric-ca-client register --caname ca-citizen --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles $CA_CERT_PATH_CITIZEN
  fabric-ca-client register --caname ca-citizen --id.name Admin@citizen.land.com --id.secret adminpw --id.type admin --tls.certfiles $CA_CERT_PATH_CITIZEN
  
  local PEER_MSP_DIR_CITIZEN=${CRYPTO_DIR}/peerOrganizations/citizen.land.com/peers/peer0.citizen.land.com/msp
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:8054 --caname ca-citizen -M $PEER_MSP_DIR_CITIZEN --tls.certfiles $CA_CERT_PATH_CITIZEN
  cp "${ROOT_DIR}/config/config.yaml" "${PEER_MSP_DIR_CITIZEN}/config.yaml"
  
  local PEER_TLS_DIR_CITIZEN=${CRYPTO_DIR}/peerOrganizations/citizen.land.com/peers/peer0.citizen.land.com/tls
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:8054 --caname ca-citizen -M $PEER_TLS_DIR_CITIZEN --enrollment.profile tls --csr.hosts peer0.citizen.land.com --csr.hosts localhost --tls.certfiles $CA_CERT_PATH_CITIZEN
  cp $PEER_TLS_DIR_CITIZEN/tlscacerts/* $PEER_TLS_DIR_CITIZEN/ca.crt && cp $PEER_TLS_DIR_CITIZEN/signcerts/* $PEER_TLS_DIR_CITIZEN/server.crt && cp $PEER_TLS_DIR_CITIZEN/keystore/* $PEER_TLS_DIR_CITIZEN/server.key

  local ADMIN_MSP_DIR_CITIZEN=${CRYPTO_DIR}/peerOrganizations/citizen.land.com/users/Admin@citizen.land.com/msp
  fabric-ca-client enroll -u https://Admin@citizen.land.com:adminpw@localhost:8054 --caname ca-citizen -M $ADMIN_MSP_DIR_CITIZEN --tls.certfiles $CA_CERT_PATH_CITIZEN
  cp "${ROOT_DIR}/config/config.yaml" "${ADMIN_MSP_DIR_CITIZEN}/config.yaml"

  local ORG_MSP_DIR_CITIZEN=${CRYPTO_DIR}/peerOrganizations/citizen.land.com/msp
  mkdir -p $ORG_MSP_DIR_CITIZEN/admincerts $ORG_MSP_DIR_CITIZEN/cacerts $ORG_MSP_DIR_CITIZEN/tlscacerts
  cp $PEER_TLS_DIR_CITIZEN/ca.crt $ORG_MSP_DIR_CITIZEN/cacerts/ca.crt
  cp $PEER_TLS_DIR_CITIZEN/ca.crt $ORG_MSP_DIR_CITIZEN/tlscacerts/tlsca.crt
  cp $ADMIN_MSP_DIR_CITIZEN/signcerts/cert.pem $ORG_MSP_DIR_CITIZEN/admincerts/cert.pem
  cp "${ROOT_DIR}/config/config.yaml" "${ORG_MSP_DIR_CITIZEN}/config.yaml"
}


function createOrderer(){
  echo "--- Generating Crypto Material for Orderer ---"
  export FABRIC_CA_CLIENT_HOME=${CRYPTO_DIR}/ordererOrganizations/land.com/
  local CA_CERT_PATH=${CRYPTO_DIR}/fabric-ca/gov/ca-cert.pem
  
  fabric-ca-client enroll -u https://admin:adminpw@localhost:7054 --caname ca-gov --tls.certfiles $CA_CERT_PATH
  fabric-ca-client register --caname ca-gov --id.name orderer --id.secret ordererpw --id.type orderer --tls.certfiles $CA_CERT_PATH
  fabric-ca-client register --caname ca-gov --id.name Admin@land.com --id.secret adminpw --id.type admin --tls.certfiles $CA_CERT_PATH

  local ORDERER_MSP_DIR=${CRYPTO_DIR}/ordererOrganizations/land.com/orderers/orderer.land.com/msp
  fabric-ca-client enroll -u https://orderer:ordererpw@localhost:7054 --caname ca-gov -M $ORDERER_MSP_DIR --tls.certfiles $CA_CERT_PATH
  
  local ORDERER_TLS_DIR=${CRYPTO_DIR}/ordererOrganizations/land.com/orderers/orderer.land.com/tls
  fabric-ca-client enroll -u https://orderer:ordererpw@localhost:7054 --caname ca-gov -M $ORDERER_TLS_DIR --enrollment.profile tls --csr.hosts orderer.land.com --csr.hosts localhost --tls.certfiles $CA_CERT_PATH
  cp $ORDERER_TLS_DIR/tlscacerts/* $ORDERER_TLS_DIR/ca.crt 
  cp $ORDERER_TLS_DIR/signcerts/* $ORDERER_TLS_DIR/server.crt 
  cp $ORDERER_TLS_DIR/keystore/* $ORDERER_TLS_DIR/server.key

  local ADMIN_MSP_DIR=${CRYPTO_DIR}/ordererOrganizations/land.com/users/Admin@land.com/msp
  fabric-ca-client enroll -u https://Admin@land.com:adminpw@localhost:7054 --caname ca-gov -M $ADMIN_MSP_DIR --tls.certfiles $CA_CERT_PATH

  local ADMIN_TLS_DIR=${CRYPTO_DIR}/ordererOrganizations/land.com/users/Admin@land.com/tls
  fabric-ca-client enroll -u https://Admin@land.com:adminpw@localhost:7054 --caname ca-gov -M $ADMIN_TLS_DIR --enrollment.profile tls --csr.hosts Admin@land.com --csr.hosts localhost --tls.certfiles $CA_CERT_PATH

  local ORG_MSP_DIR=${CRYPTO_DIR}/ordererOrganizations/land.com/msp
  mkdir -p $ORG_MSP_DIR/admincerts $ORG_MSP_DIR/cacerts $ORG_MSP_DIR/tlscacerts
  cp $ORDERER_TLS_DIR/ca.crt $ORG_MSP_DIR/cacerts/ca.crt
  cp $ORDERER_TLS_DIR/ca.crt $ORG_MSP_DIR/tlscacerts/tlsca.crt
  cp $ADMIN_MSP_DIR/signcerts/cert.pem $ORG_MSP_DIR/admincerts/cert.pem
  cp "${ROOT_DIR}/config/config.yaml" "${ORG_MSP_DIR}/config.yaml"

  mkdir -p "$ORDERER_MSP_DIR/admincerts" && cp "$ADMIN_MSP_DIR/signcerts/cert.pem" "$ORDERER_MSP_DIR/admincerts/"
}


function createChannel() {
  echo "--- Creating channel genesis block ---"
  docker exec cli bash -c "
    # THIS LINE WAS MISSING. It tells the container where to find configtx.yaml
    export FABRIC_CFG_PATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/config
    
    configtxgen -profile LandChannel -outputBlock ./fabric-network/channel-artifacts/landchannel.block -channelID landchannel
  " || { echo "❌ Failed to generate channel genesis block"; exit 1; }

  echo "--- Having orderer join the channel ---"
  docker exec cli bash -c "
    ADMIN_TLS_KEY=\$(find /opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/ordererOrganizations/land.com/users/Admin@land.com/tls/keystore -type f)
    
    osnadmin channel join --channelID landchannel --config-block ./fabric-network/channel-artifacts/landchannel.block -o orderer.land.com:9444 \
    --ca-file /opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/ordererOrganizations/land.com/orderers/orderer.land.com/tls/ca.crt \
    --client-cert /opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/ordererOrganizations/land.com/users/Admin@land.com/tls/signcerts/cert.pem \
    --client-key \"\$ADMIN_TLS_KEY\"
  " || { echo "❌ Failed to have orderer join channel"; exit 1; }

  sleep 3

  echo "--- Joining GovOrg Peer to Channel ---"
  docker exec cli bash -c "
    export FABRIC_CFG_PATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/config
    export CORE_PEER_LOCALMSPID='GovOrgMSP'
    export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/peerOrganizations/gov.land.com/users/Admin@gov.land.com/msp
    export CORE_PEER_ADDRESS=peer0.gov.land.com:7051
    export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/peerOrganizations/gov.land.com/peers/peer0.gov.land.com/tls/ca.crt
    
    peer channel fetch 0 ./fabric-network/channel-artifacts/landchannel.block -c landchannel -o orderer.land.com:7050 --ordererTLSHostnameOverride orderer.land.com --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/ordererOrganizations/land.com/orderers/orderer.land.com/tls/ca.crt &&
    peer channel join -b ./fabric-network/channel-artifacts/landchannel.block
  " || { echo "❌ GovOrg Peer failed to join channel"; exit 1; }

  echo "--- Joining CitizenOrg Peer to Channel ---"
  docker exec cli bash -c "
    export FABRIC_CFG_PATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/config
    export CORE_PEER_LOCALMSPID='CitizenOrgMSP'
    export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/peerOrganizations/citizen.land.com/users/Admin@citizen.land.com/msp
    export CORE_PEER_ADDRESS=peer0.citizen.land.com:9051
    export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/peerOrganizations/citizen.land.com/peers/peer0.citizen.land.com/tls/ca.crt

    peer channel fetch 0 ./fabric-network/channel-artifacts/landchannel.block -c landchannel -o orderer.land.com:7050 --ordererTLSHostnameOverride orderer.land.com --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/ordererOrganizations/land.com/orderers/orderer.land.com/tls/ca.crt &&
    peer channel join -b ./fabric-network/channel-artifacts/landchannel.block
  " || { echo "❌ CitizenOrg Peer failed to join channel"; exit 1; }
  
  echo "✅ Channel 'landchannel' created and all peers have joined."
}


function deployCC() {
  echo "--- Packaging Chaincode ---"
  docker exec cli bash -c "
    peer lifecycle chaincode package landcc.tar.gz --path /opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/chaincode/landcc --lang golang --label landcc_1.0
  " || { echo "❌ Failed to package chaincode"; exit 1; }

  echo "--- Installing Chaincode on GovOrg Peer ---"
  docker exec cli bash -c "
    export CORE_PEER_TLS_ENABLED=true
    export CORE_PEER_LOCALMSPID='GovOrgMSP'
    export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/peerOrganizations/gov.land.com/users/Admin@gov.land.com/msp
    export CORE_PEER_ADDRESS=peer0.gov.land.com:7051
    export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/peerOrganizations/gov.land.com/peers/peer0.gov.land.com/tls/ca.crt
    peer lifecycle chaincode install landcc.tar.gz --connTimeout 15s
  " || { echo "❌ Failed to install chaincode on GovOrg peer"; exit 1; }

  echo "--- Installing Chaincode on CitizenOrg Peer ---"
  docker exec cli bash -c "
    export CORE_PEER_TLS_ENABLED=true
    export CORE_PEER_LOCALMSPID='CitizenOrgMSP'
    export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/peerOrganizations/citizen.land.com/users/Admin@citizen.land.com/msp
    export CORE_PEER_ADDRESS=peer0.citizen.land.com:9051
    export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/peerOrganizations/citizen.land.com/peers/peer0.citizen.land.com/tls/ca.crt
    peer lifecycle chaincode install landcc.tar.gz --connTimeout 15s
  " || { echo "❌ Failed to install chaincode on CitizenOrg peer"; exit 1; }

  echo "--- Querying for Package ID ---"
  PACKAGE_ID=$(docker exec cli bash -c "
    export CORE_PEER_TLS_ENABLED=true
    export CORE_PEER_LOCALMSPID='GovOrgMSP'
    export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/peerOrganizations/gov.land.com/users/Admin@gov.land.com/msp
    export CORE_PEER_ADDRESS=peer0.gov.land.com:7051
    export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/peerOrganizations/gov.land.com/peers/peer0.gov.land.com/tls/ca.crt
    peer lifecycle chaincode queryinstalled --connTimeout 10s
  " | grep 'Package ID: landcc_1.0' | sed -n 's/Package ID: //;s/, Label:.*$//;p')
  
  echo "Package ID is: ${PACKAGE_ID}"
  if [ -z "${PACKAGE_ID}" ]; then
    echo "❌ Could not find package ID. Chaincode installation likely failed."
    exit 1
  fi

  echo "--- Approving Chaincode for GovOrg ---"
  docker exec cli bash -c "
    export CORE_PEER_TLS_ENABLED=true
    export CORE_PEER_LOCALMSPID='GovOrgMSP'
    export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/peerOrganizations/gov.land.com/users/Admin@gov.land.com/msp
    export CORE_PEER_ADDRESS=peer0.gov.land.com:7051
    export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/peerOrganizations/gov.land.com/peers/peer0.gov.land.com/tls/ca.crt
    peer lifecycle chaincode approveformyorg -o orderer.land.com:7050 --ordererTLSHostnameOverride orderer.land.com --channelID landchannel --name landcc --version 1.0 --package-id '${PACKAGE_ID}' --sequence 1 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/ordererOrganizations/land.com/orderers/orderer.land.com/tls/ca.crt
  " || { echo "❌ Failed to approve chaincode for GovOrg"; exit 1; }

  echo "--- Approving Chaincode for CitizenOrg ---"
  docker exec cli bash -c "
    export CORE_PEER_TLS_ENABLED=true
    export CORE_PEER_LOCALMSPID='CitizenOrgMSP'
    export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/peerOrganizations/citizen.land.com/users/Admin@citizen.land.com/msp
    export CORE_PEER_ADDRESS=peer0.citizen.land.com:9051
    export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/peerOrganizations/citizen.land.com/peers/peer0.citizen.land.com/tls/ca.crt
    peer lifecycle chaincode approveformyorg -o orderer.land.com:7050 --ordererTLSHostnameOverride orderer.land.com --channelID landchannel --name landcc --version 1.0 --package-id '${PACKAGE_ID}' --sequence 1 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/ordererOrganizations/land.com/orderers/orderer.land.com/tls/ca.crt
  " || { echo "❌ Failed to approve chaincode for CitizenOrg"; exit 1; }

  echo "--- Committing Chaincode Definition to the Channel ---"
docker exec cli bash -c "
  # Set the environment variables to act as the GovOrg admin
  export CORE_PEER_TLS_ENABLED=true
  export CORE_PEER_LOCALMSPID='GovOrgMSP'
  export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/peerOrganizations/gov.land.com/users/Admin@gov.land.com/msp
  export CORE_PEER_ADDRESS=peer0.gov.land.com:7051
  export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/peerOrganizations/gov.land.com/peers/peer0.gov.land.com/tls/ca.crt

  peer lifecycle chaincode commit -o orderer.land.com:7050 --ordererTLSHostnameOverride orderer.land.com --channelID landchannel --name landcc --version 1.0 --sequence 1 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/ordererOrganizations/land.com/orderers/orderer.land.com/tls/ca.crt --peerAddresses peer0.gov.land.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/peerOrganizations/gov.land.com/peers/peer0.gov.land.com/tls/ca.crt --peerAddresses peer0.citizen.land.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/peerOrganizations/citizen.land.com/peers/peer0.citizen.land.com/tls/ca.crt
" || { echo "❌ Failed to commit chaincode"; exit 1; }

  echo "✅ Chaincode Deployed."
}

# --- Main script logic ---
MODE=$1
if [ "$MODE" == "up" ]; then
  up
elif [ "$MODE" == "createCrypto" ]; then
  createCrypto
elif [ "$MODE" == "createChannel" ]; then
  createChannel
elif [ "$MODE" == "setAnchorPeers" ]; then
  setAnchorPeers
elif [ "$MODE" == "deployCC" ]; then
  deployCC
elif [ "$MODE" == "down" ]; then
  down
else
  echo "Usage: ./network.sh [up|down|createCrypto|createChannel|setAnchorPeers|deployCC]"
  exit 1
fi