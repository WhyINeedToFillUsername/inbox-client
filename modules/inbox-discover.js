const tripledoc = require('tripledoc');
const rdfnamespaces = require('rdf-namespaces');
const addAlert = require('./alerts');

const ldp = rdfnamespaces.ldp; // http://www.w3.org/ns/ldp


const discover = {
    discoverInbox: async function (resourceIRI) {
        try {
            const iriDoc = await tripledoc.fetchDocument(resourceIRI);
            const subject = iriDoc.getSubject(resourceIRI);
            const inboxIri = subject.getRef(ldp.inbox);

            return inboxIri;
        } catch (err) {
            addAlert('danger', "Didn't find inbox on the supplied IRI: '" + resourceIRI + "'. Check the address please.");
            return false;
        }
    }
};

module.exports = discover;