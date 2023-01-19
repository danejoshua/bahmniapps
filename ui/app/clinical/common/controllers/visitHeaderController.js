'use strict';

angular.module('bahmni.clinical')
    .controller('VisitHeaderController', ['$rootScope', '$scope', '$state', 'clinicalAppConfigService', 'patientContext', 'visitHistory', 'visitConfig', 'contextChangeHandler', '$location', '$stateParams', 'urlHelper', 'treatmentService',
        function ($rootScope, $scope, $state, clinicalAppConfigService, patientContext, visitHistory, visitConfig, contextChangeHandler, $location, $stateParams, urlHelper, treatmentService) {
            $scope.patient = patientContext.patient;
            $scope.visitHistory = visitHistory;
            $scope.consultationBoardLink = clinicalAppConfigService.getConsultationBoardLink();
            $scope.showControlPanel = false;
            $scope.visitTabConfig = visitConfig;

            $scope.switchTab = function (tab) {
                $scope.visitTabConfig.switchTab(tab);
                $rootScope.$broadcast('event:clearVisitBoard', tab);
            };

            $scope.gotoPatientDashboard = function () {
                if (contextChangeHandler.execute()["allow"]) {
                    $location.path($stateParams.configName + "/patient/" + patientContext.patient.uuid + "/dashboard");
                }
            };

            $scope.openConsultation = function () {
                var board = clinicalAppConfigService.getAllConsultationBoards()[0];
                var urlPrefix = urlHelper.getPatientUrl();
                $scope.collapseControlPanel();
                $rootScope.hasVisitedConsultation = true;
                var url = "/" + $stateParams.configName + (board.url ? urlPrefix + "/" + board.url : urlPrefix);
                var extensionParams = board.extensionParams;
                var queryParams = [];
                if ($stateParams.programUuid) {
                    var programParams = {
                        "programUuid": $stateParams.programUuid,
                        "enrollment": $stateParams.enrollment
                    };
                    extensionParams = _.merge(programParams, extensionParams);
                }
                angular.forEach(extensionParams, function (extensionParamValue, extensionParamKey) {
                    queryParams.push(extensionParamKey + "=" + extensionParamValue);
                });
                if (!_.isEmpty(queryParams)) {
                    url = url + "?" + queryParams.join("&");
                }

                $location.url(url);
            };

            $scope.closeTab = function (tab) {
                $scope.visitTabConfig.closeTab(tab);
                $rootScope.$broadcast("event:clearVisitBoard", tab);
            };

            $scope.print = function () {
                $rootScope.$broadcast("event:printVisitTab", $scope.visitTabConfig.currentTab);
            };

            $scope.showPrint = function () {
                return $scope.visitTabConfig.showPrint();
            };
            $scope.convertHTMLToPDF = function () {
                html2canvas(document.getElementById("patient-summary-details"), {
                    onrendered: function (canvas) {
                        var data = canvas.toDataURL();
                        var docDefinition = {
                            content: [{ image: data, width: 500 }]
                        };
                        var pdf = pdfMake.createPdf(docDefinition);
                        pdf.getBase64((pdfContent) => {
                            treatmentService.sendPrescriptions(pdfContent, $scope.patient);
                        });
//                        var pdf = pdfMake.createPdf(docDefinition);
//                        pdf.getBuffer((buffer) => {
//                            console.log('----------------------- Buffer -------------------------');
//                            console.log(buffer);
//                            console.log('------------------------------------------------');
//                        });
//
//                        var pdf = pdfMake.createPdf(docDefinition);
//                        pdf.getBlob((blob) => {
//                            console.log('----------------------- Blob -------------------------');
//                            console.log(blob);
//                            console.log('------------------------------------------------');
//                        });
                        /* var document = pdfMake.createPdf(docDefinition).download(); // getStream()
                        console.log('document ', document); */
                    }
                });
            };
        }]);
