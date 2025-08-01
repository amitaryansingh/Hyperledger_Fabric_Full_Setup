#!/bin/bash
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="GovOrgMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto-config/peerOrganizations/gov.land.com/peers/peer0.gov.land.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto-config/peerOrganizations/gov.land.com/users/Admin@gov.land.com/msp
export CORE_PEER_ADDRESS=peer0.gov.land.com:7051