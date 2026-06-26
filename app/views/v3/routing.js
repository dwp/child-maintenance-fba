//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

router.post('/live-in-uk-answer', function(request, response) {

    var liveInUK = request.session.data['live-in-uk']
    if (liveInUK == "Yes"){
        response.redirect("/next-question")
    } else {
        response.redirect("/ineligible")
    }
})