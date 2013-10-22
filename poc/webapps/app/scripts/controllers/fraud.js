/*global angular, jQuery, _*/
(function () {
'use strict';

angular.module('fraud')

    .controller('FraudController', ['$scope', 'rest', 'socket', function ($scope, rest, socket) {
        
        // topic for publishing transactions
        var txTopic = 'demos.app.frauddetect.submitTransaction';
        
        $scope.appURL = '#';
        $scope.appId = rest.getAppId(settings.fraud.appName);
        $scope.$watch('appId', function (appId) {
            if (appId) {
                $scope.appURL = settings.appsURL + appId;
            }
        });
        
        // Options for merchant, terminal, zip, card, bin
        $scope.merchants = ['Wal-Mart', 'Target', 'Amazon', 'Apple', 'Sears', 'Macys', 'JCPenny', 'Levis'];
        $scope.terminals = [1, 2, 3, 4, 5, 6, 7, 8];
        $scope.zips      = [94086, 94087, 94088, 94089, 94090, 94091, 94092, 94093]
        $scope.actions   = [
            {
                id: 1,
                subtitle: 'suspicious transaction sequence',
                description: 'This anomaly is when one credit card is used for a small purchase, then immediately again for a larger purchase. The idea here is that a scammer will first try a small purchase to ensure that the card works, then proceed with a larger purchase upon success.',
                generateTxns: function(e) {
                    
                    var bin = getRandomBin();
                    var card = getRandomCard();
                    
                    socket.publish( txTopic, { 
                        'zipCode': getRandom('zips'),
                        'merchantId': getRandom('merchants'), 
                        'terminalId': getRandom('terminals'),
                        'bankIdNum': bin,
                        'ccNum': card,
                        'amount': 5.00
                    });
                    
                    setTimeout(function() {
                        socket.publish( txTopic, { 
                            'zipCode': getRandom('zips'),
                            'merchantId': getRandom('merchants'), 
                            'terminalId': getRandom('terminals'),
                            'bankIdNum': bin,
                            'ccNum': card,
                            'amount': 44000.00
                        });
                    }, 5000)
                    
                }
            },
            {
                id: 2,
                subtitle: 'same card number multiple times',
                description: 'This anomaly is when one credit card is used for multiple transactions across one or more vendors within a short time interval.',
                generateTxns: function() {
                    
                    var bin = getRandomBin();
                    var card = getRandomCard();
                    
                    var intval = setInterval(function() {
                        socket.publish(txTopic, {
                            'zipCode': getRandom('zips'),
                            'merchantId': getRandom('merchants'), 
                            'terminalId': getRandom('terminals'),
                            'bankIdNum': bin,
                            'ccNum': card,
                            'amount': roundToPrice(10 + Math.random() * 1000)
                        });
                    }, 1000);
                    
                    setTimeout(function() {
                        clearInterval(intval);
                    }, 8000);
                }
            },
            {
                id: 3,
                subtitle: 'same BIN used multiple times',
                description: 'This anomaly is when several transactions are made with cards sharing the same Bank Identification Number (first 12 digits). An employee at a bank may use this tactic to attempt fraud.',
                generateTxns: function() {
                    var bin = getRandomBin();
                    
                    var intval = setInterval(function() {
                        socket.publish(txTopic, {
                            'zipCode': getRandom('zips'),
                            'merchantId': getRandom('merchants'), 
                            'terminalId': getRandom('terminals'),
                            'bankIdNum': bin,
                            'ccNum': getRandomCard(),
                            'amount': roundToPrice(10 + Math.random() * 1000)
                        });
                    }, 100);
                    
                    setTimeout(function() {
                        clearInterval(intval);
                    }, 8000);
                }
            },
            {
                id: 4,
                subtitle: 'spike in average transaction amount',
                description: 'This anomaly is when the average transaction amount rises by a significant amount.',
                generateTxns: function() {
                    var bin = getRandomBin();
                    
                    var intval = setInterval(function() {
                        socket.publish(txTopic, {
                            'zipCode': getRandom('zips'),
                            'merchantId': getRandom('merchants'), 
                            'terminalId': getRandom('terminals'),
                            'bankIdNum': getRandomBin(),
                            'ccNum': getRandomCard(),
                            'amount': roundToPrice(10000 + Math.random() * 1000)
                        });
                    }, 1000);
                    
                    setTimeout(function() {
                        clearInterval(intval);
                    }, 10000);
                }
            }
        ];
        
        // subscribe to appropriate topic for alerts
        $scope.appId.then(function(appId) {
            socket.subscribe('demos.app.frauddetect.ccFraudAlert', function(data) {
                if (data.data.userGenerated === "true" || data.data.userGenerated === true) {
                    console.log('pushing to alerts');
                    $scope.alerts.push(data.data);
                }
            });
            socket.subscribe('demos.app.frauddetect.avgFraudAlert', function(data) {
                if (data.data.userGenerated === "true" || data.data.userGenerated === true) {
                    console.log('avgFraudAlert triggered: ', data);
                }
            });
            socket.subscribe('demos.app.frauddetect.submitTransaction', function(data) {
                console.log('transaction has been sent');
            });
        });
        
        $scope.alerts = [];
        
        // helper function for choosing random items from a list
        function getRandom(list) {
            return $scope[list][ Math.floor(Math.random() * $scope[list].length) ];
        }
        function roundToPrice(amt) {
            return Math.round( amt * 100 ) / 100;
        }
        function getRandomBin() {
            // Bank ID will be between 1000 0000 and 3500 0000 (25 BINs)
            var base = Math.floor(Math.random() * 25) + 10;
            return base + "00 0000";
        }
        function getRandomCard() {
            // CC will be 1000 0000 to 1400 0000 (400,000 cards per BIN)
            var base = Math.floor(Math.random() * 400000) + 10000000;
            var baseString = base + '';
            return baseString.substring(0, 4) + " " + baseString.substring(4);
        }
    }]);

})();
