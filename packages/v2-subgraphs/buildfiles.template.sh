set -e

NETWORK="{{network}}"
GITHUB_ORG="${GITHUB_ORG:=hop-protocol}"

npx mustache config/$NETWORK.json subgraph.template.yaml > subgraph.yaml

TEMP_CONFIG="/tmp/config_${NETWORK}.json"
cat config/$NETWORK.json | jq "{ network: .network, isMainnet: .isMainnet, subgraphName: .subgraphName }" > $TEMP_CONFIG

#npx mustache $TEMP_CONFIG config/mapping_config.template.json > config/${NETWORK}.json
{{#isMainnet}}
npx mustache $TEMP_CONFIG src/hubCoreMessenger.template.ts > src/hubCoreMessenger_mapping_${NETWORK}.ts
{{/isMainnet}}
{{^isMainnet}}
npx mustache $TEMP_CONFIG src/spokeCoreMessenger.template.ts > src/spokeCoreMessenger_mapping_${NETWORK}.ts
{{/isMainnet}}

npm run codegen
npm run build

if (test "$IS_SUBGRAPH_STUDIO" = "true"); then
  echo 'running subgraph studio build'
  # auth studio (comment this out when deploying locally):
  #npx graph auth --studio $DEPLOY_KEY

  # deploy studio (comment this out when deploying locally):
  #npx graph deploy --debug --studio "$GITHUB_ORG/{{subgraphName}}"
else
  echo 'running hosted build'
  # auth (comment this out when deploying locally):
  #npx graph auth https://api.thegraph.com/deploy/ $ACCESS_TOKEN

  # deploy (comment this out when deploying locally):
  npx graph deploy --debug --product hosted-service --ipfs https://api.thegraph.com/ipfs/ --node https://api.thegraph.com/deploy/ "$GITHUB_ORG/{{subgraphName}}"
fi

# running local (run this in seperate terminal):
# docker-compose up
# npx graph create hop-protocol/hop-nova --node http://127.0.0.1:8020

# uncomment this line here for local deployment and comment out all 'graph auth' and 'graph deploy' lines above:
# npx graph deploy --debug --ipfs http://localhost:5001 --node http://localhost:8020 hop-protocol/hop-nova
