'use strict';

angular.module('opd.consultation.controllers')
    .controller('VisitController', ['$scope', 'encounterService', 'visitService', 'patientVisitHistoryService','$route','$location', '$rootScope', function ($scope, encounterService, visitService, patientVisitHistoryService, $route, $location, $rootScope) {
    var visitUuid = $route.current.params["visitUuid"];    
	$scope.visitDays = [];
    $scope.hasMoreVisitDays;
    var currentEncounterDate;
    var loading;
    var DateUtil = Bahmni.Common.Util.DateUtil;

    patientVisitHistoryService.getVisits($rootScope.patient.uuid).then(function(visits){
        $scope.visits = visits.map(function(visitData){ return new Bahmni.Opd.Consultation.VisitHistoryEntry(visitData) });
    });        

    visitService.getVisitSummary($route.current.params.visitUuid).success(function (encounterTransactions) {
        $scope.visitSummary = Bahmni.Opd.Consultation.VisitSummary.create(encounterTransactions);
        if($scope.visitSummary.hasEncounters()) {
            loadEncounters($scope.visitSummary.mostRecentEncounterDateTime);
        }
    });

    $scope.showVisitSummary = function(visit) {
        $location.path('/visit/' + visit.uuid);
    }

    var markLoadingDone = function() {
        loading = false;
    }

    var loadEncounters = function(encounterDate) {
    	if(loading) return;
        loading = true;
        encounterService.search(visitUuid, encounterDate.toISOString().substring(0, 10)).success(function(encounterTransactions){
            var dayNumber = DateUtil.getDayNumber($scope.visitSummary.visitStartDateTime, encounterDate);
            var visitDay = Bahmni.Opd.Consultation.VisitDay.create(dayNumber, encounterDate, encounterTransactions, $scope.consultationNoteConcept, $scope.encounterConfig.orderTypes);
            $scope.visitDays.push(visitDay);
	    }).then(markLoadingDone, markLoadingDone);
    	currentEncounterDate = encounterDate;
        $scope.hasMoreVisitDays = currentEncounterDate > $scope.visitSummary.visitStartDateTime;
    }

    $scope.loadEncountersForPreviousDay = function() {    	
        if($scope.hasMoreVisitDays) {
            var previousDate = new Date(currentEncounterDate.valueOf() - 60 * 1000 * 60 * 24);
            loadEncounters(previousDate)            
        } 
    };
}])
.directive('observationSummary',function () {
    return {
        restrict:'E',
        scope:{
            observation:"="
        },
        template: "<ng-include src=\"'observationSummaryTemplate'\"/>"
    }
});
