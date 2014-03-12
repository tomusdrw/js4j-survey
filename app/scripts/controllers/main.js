'use strict';

angular.module('surveyApp')
    .controller('MainCtrl', function($scope, $http, $window) {
        $scope.finished = !! $window.localStorage['survey-answers'];

        $scope.rates = ['NA', 'poor', 'fair', 'satisfactory', 'good', 'very good'];
        $scope.maxRate = 5;

        $scope.goodRate = 3.0;

        $scope.questions = [{
            q: 'How well did the content of the course meet yor needs?',
            hint: ''
        }, {
            q: 'How well were the course objectives met?',
            hint: 'Training objectives: concerning course objectives presented by trainer'
        }, {
            q: 'How well did the exercises support your learning (if applicable)?',
            hint: ''
        }, {
            q: 'How would you rate the quality of the training materials?',
            hint: 'Quality of training materials: materials useful during and after the training.'
        }, {
            q: 'How would you rate the subject knowledge of the trainer?',
            hint: ''
        }, {
            q: 'How would you rate trainer’s communicative skills?',
            hint: 'Communicative skills: ability to share/transfer knowledge'
        }, {
            q: 'How would you rate trainer’s contact with participants?',
            hint: 'Contact with participants: e.g. answering questions etc.'
        }, {
            q: 'How would you rate trainer’s time management?',
            hint: 'Time management: punctuality, breaks etc.'
        }, {
            q: 'In my opinion the course duration vs. subject was',
            hint: ''
        }, {
            q: 'How would you evaluate the course in general?',
            hint: ''
        }, {
            q: 'How would you recommend this training to others?',
            hint: ''
        }];

        $scope.comments = "";

        $scope.hoveringOver = function(scope, value) {
            scope.overStar = value;
            scope.percent = 100 * (value / $scope.maxRate);
        };

        $scope.getRate = function(rate) {
            return $scope.rates[Math.ceil(rate)];
        };

        $scope.avg = 0;
        var updateAll = function() {
            var filled = $scope.questions.map(function(q) {
                return q.rate;
            }).filter(function(rate) {
                return !!rate;
            });
            if (filled.length) {
                $scope.avg = filled.reduce(function(memo, r) {
                    return memo + r;
                }, 0) / filled.length;
            } else {
                $scope.avg = 0;
            }
            $scope.isEverythingFilled = filled.length === $scope.questions.length;
            if ($scope.avg / $scope.maxRate <= 0.5) {
                $scope.isEverythingFilled = $scope.isEverythingFilled && $scope.comments.length;
            }
        };
        $scope.$watch('questions', updateAll, true);
        $scope.$watch('comments', updateAll);

        $scope.submit = function() {
            var pack = {
                questions: $scope.questions,
                comments: $scope.comments
            };

            $http.post('/data', {
                data: pack
            }).then(function() {
                $window.localStorage['survey-answers'] = JSON.stringify(pack);
                $scope.finished = true;
            });
        };
    });

angular.module('surveyApp')
    .controller('ResultsCtrl', function($scope, $http, $timeout) {

        var groupResults = function(series, results) {
            var r = {};

            results.map(function(res) {
                res.questions.map(function(q) {
                    r[q.q] = r[q.q] || [];
                    r[q.q].push(q.rate);
                });
            });


            var result = series.map(function(k, v) {
                var avg = r[k].reduce(function(sum, k) {
                    return sum + k;
                }, 0) / results.length;
                return avg;
            });
            return [{
                x: 'Avg Rating',
                y: result
            }];
        };

        $scope.config = {
            "labels": false,
            "title": "Avg Rating",
            "legend": {
                "display": true,
                "position": "right"
            }
        };
        $scope.data = {
            series: ["a"],
            data: [{
                x: "a",
                y: [0]
            }]
        };

        $scope.results = [];
        var callResults = function() {
            $http.get('/data/results').then(function(data) {
                $timeout(callResults, 2000);

                var results = data.data;
                if ($scope.results.length === results.length) {
                    return;
                }
                $scope.results = results;

                $scope.series = results[0].questions.map(function(r) {
                    return r.q
                });

                $scope.data = {
                    series: $scope.series,
                    data: groupResults($scope.series, results)
                };
            });
        };
        callResults();
    });