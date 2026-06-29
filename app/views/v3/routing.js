module.exports = function (router) {

  router.post('/v3/arrangement/arrangement-type-answer', function (req, res) {
    var arrangementType = req.session.data['arrangement-type'];

    if (arrangementType === "regular" || arrangementType === "both") {
      res.redirect("regular-payment");
    } else if (arrangementType === "shared") {
      res.redirect("shared-costs");
    } else if (arrangementType === "other") {
      res.redirect("what-is-your-arrangement");
    }
  });

  router.post('/v3/arrangement/regular-and-shared-check', function (req, res) {
    var regularAndShared = req.session.data['arrangement-type'];

    if (regularAndShared == "both"){
      res.redirect("shared-costs");
    } else {
      res.redirect("anything-else");
    }
  });

  router.post('/v3/arrangement/varied-check', function (req, res) {
    var variedCheck = req.session.data['shared-cost-payment'];

    if (variedCheck == "varied"){
      res.redirect("varied-costs");
    } else {
      res.redirect("anything-else");
    }
  });  

  router.post('/v3/arrangement/save-online-answer', function (req, res) {
    var saveOnline = req.session.data['save-online-decision'];

    if (saveOnline == "yes") {

      req.session.data['arrangementSaved'] = 'yes';

      res.redirect("one-login");
    } else {
      res.redirect("set-reminder");
    }
  });

  router.post('/v3/arrangement/set-reminder-answer', function (req, res) {
    var setReminder = req.session.data['setReminder'];

    if (setReminder == "yes"){
      res.redirect("output-reminder");
    } else {
      res.redirect("output-download");
    }
  });      
  
};
