#!/bin/bash
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="CitizenOrgMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto-config/peerOrganizations/citizen.land.com/peers/peer0.citizen.land.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto-config/peerOrganizations/citizen.land.com/users/Admin@citizen.land.com/msp
export CORE_PEER_ADDRESS=peer0.citizen.land.com:9051