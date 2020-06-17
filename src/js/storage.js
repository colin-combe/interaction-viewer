//    xiNET Cross-link Viewer
//    Copyright 2014 Rappsilber Laboratory
//
//    This product includes software developed at
//    the Rappsilber Laboratory (http://www.rappsilberlab.org/).
//
//    author: Colin Combe
//
//    xiNET_Storage.js

//not actually using local storage, can be problems with it filling up
//this just fetches unniprotkb and superfam annotations from web services
//// TODO: get rid of?

import * as d3 from 'd3';
import {Annotation} from './viz/interactor/annotation';
import {Feature} from './viz/feature';

export function storage() {//todo this is weird
}

storage.ns = 'xiNET.';

storage.accessionFromId = function (id) {
    let idRegex;
    // i cant figure out way to do this purely with regex... who cares
    if (id.indexOf('(') !== -1) { //id has participant number in it
        idRegex = /uniprotkb_(.*)(\()/;
    } else {
        idRegex = /uniprotkb_(.*)/;
    }
    const match = idRegex.exec(id);
    if (match) {
        return match[1];
    } else if (id.indexOf('|') !== -1) {
        //following reads swiss-prot style identifiers
        return id.split('|')[1];
    } else {
        return id;
    }
};

storage.getUniProtTxt = function (id, callback) {
    const accession = storage.accessionFromId(id);

    function uniprotWebService() {
        const url = 'https://www.ebi.ac.uk/proteins/api/proteins/' + accession;
        d3.json(url, function (txt) {
            //~ // console.log(accession + " retrieved from UniProt.");
            //~ if(typeof(Storage) !== "undefined") {
            //~ localStorage.setItem(xiNET_Storage.ns  + "UniProtKB."+ accession, txt);
            //~ //console.log(accession + " UniProt added to local storage.");
            //~ }
            callback(id, txt);
        });
    }

    //~ if(typeof(Storage) !== "undefined") {
    //~ // Code for localStorage/sessionStorage.
    //~ // console.log("Local storage found.");
    //~ // Retrieve
    //~ var stored = localStorage.getItem(xiNET_Storage.ns + "UniProtKB." + accession);
    //~ if (stored){
    // console.log(accession + " UniProt from local storage.");
    //~ callback(id, stored);
    //~ }
    //~ else {
    //~ // console.log(accession + " UniProt not in local storage.");
    //~ uniprotWebService();
    //~ }
    //~ }
    //~ else {
    // console.log("No local storage found.");
    uniprotWebService();
    //~ }
};

storage.getSequence = function (id, callback) {
    //~ var accession = xiNET_Storage.accessionFromId(id);
    storage.getUniProtTxt(id, function (noNeed, json) {
        //~ var sequence = "";
        //~ var lines = txt.split('\n');
        //~ var lineCount = lines.length;
        //~ for (var l = 0; l < lineCount; l++){
        //~ var line = lines[l];
        //~ if (line.indexOf("SQ") === 0){
        //~ //sequence = line;
        //~ l++;
        //~ for (l; l < lineCount; l++){
        //~ line = lines[l];
        //~ sequence += line;
        //~ }
        //~ }
        //~ }
        callback(id, json.sequence.replace(/[^A-Z]/g, ''));
    });
};

storage.getUniProtFeatures = function (id, callback) {
    //var accession = xiNET_Storage.accessionFromId(id);
    storage.getUniProtTxt(id, function (id, json) {
        //~ var features = new Array();
        //~ var lines = txt.split('\n');
        //~ var lineCount = lines.length;
        //~ for (var l = 0; l < lineCount; l++){
        //~ var line = lines[l];
        //~ if (line.indexOf("FT") === 0){
        //~ var fields = line.split(/\s{2,}/g);
        //~ if (fields.length > 4 && fields[1] === 'DOMAIN') {
        //~ //console.log(fields[1]);fields[4].substring(0, fields[4].indexOf("."))
        //~ var name = fields[4].substring(0, fields[4].indexOf("."));
        //~ features.push(new Annotation (name, fields[2], fields[3], null, fields[4]));
        //~ }
        //~ }
        //~ }
        callback(id, json.features.filter(function (ft) {
            return ft.type === 'DOMAIN';
        }));
    });
};

storage.getSuperFamFeatures = function (id, callback) {
    const accession = storage.accessionFromId(id);

    function superFamDAS() {
        const url = 'https://supfam.mrc-lmb.cam.ac.uk/SUPERFAMILY/cgi-bin/das/up/features?segment=' + accession;
        d3.xml(url, function (xml) {
            // xml = new XMLSerializer().serializeToString(xml);
            //~ console.log(accession + " SuperFamDAS  retrieved
            // .");
            //~ if(typeof(Storage) !== "undefined") {
            //~ localStorage.setItem(xiNET_Storage.ns  + "SuperFamDAS." + accession, xml);
            //~ // console.log(accession + " SuperFamDAS added to local storage.");
            //~ }
            parseSuperFamDAS(new XMLSerializer().serializeToString(xml));
        });
    }

    function parseSuperFamDAS(dasXml) {
        //~ console.log(dasXml);
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(dasXml, 'text/xml');
        const features = [];
        const xmlFeatures = xmlDoc.getElementsByTagName('FEATURE');
        const featureCount = xmlFeatures.length;
        for (let f = 0; f < featureCount; f++) {
            const xmlFeature = xmlFeatures[f];
            const type = xmlFeature.getElementsByTagName('TYPE')[0]; //might need to watch for text nodes getting mixed in here
            const category = type.getAttribute('category');
            if (category === 'miscellaneous') {
                const name = type.getAttribute('id');
                const start = xmlFeature.getElementsByTagName('START')[0].textContent;
                const end = xmlFeature.getElementsByTagName('END')[0].textContent;
                features.push(new Annotation(name, new Feature(null, start + '-' + end)));
            }
        }
        //~ console.log(JSON.stringify(features));
        callback(id, features);
    }

    //~ if(typeof(Storage) !== "undefined") {
    //~ // console.log("Local storage found.");
    //~ // Retrieve
    //~ var stored = localStorage.getItem(xiNET_Storage.ns + "SuperFamDAS."  + accession);
    //~ if (stored){
    //~ // console.log(accession + " SuperFamDAS from local storage.");
    //~ parseSuperFamDAS(stored);
    //~ }
    //~ else {
    //~ // console.log(accession + " SuperFamDAS not in local storage.");
    //~ superFamDAS();
    //~ }
    //~ }
    //~ else {
    // console.log("No local storage found.");
    superFamDAS();
    //~ }
};
