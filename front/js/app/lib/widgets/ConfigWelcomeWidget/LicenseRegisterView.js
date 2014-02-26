var BaseView = require('./StepView');
var LicenseModal = DT.lib.LicenseModal;
var LicenseModel = DT.lib.LicenseModel;
var LicenseTextModal = require('./LicenseTextModalView');
var LicenseFileCollection = require('./LicenseFileCollection');
var countries = require('./countries');
var LicenseRequestModel = require('./LicenseRequestModel');
var Bbind = DT.lib.Bbindings;
var Notifier = DT.lib.Notifier;

var LicenseRegisterView = BaseView.extend({

    events: {
        'click .displayLicenseInfo': 'displayLicenseInfo', //TODO
        'click .show-license-text': 'showLicenseText',
        'click .register': 'register',
        'click .upload': 'upload'
    },

    initialize: function(options) {
        BaseView.prototype.initialize.apply(this, arguments);
        this.dataSource = options.dataSource;
        this.navFlow = options.navFlow;

        this.licenseRequestModel = new LicenseRequestModel();

        this.subview('register-name', new Bbind.text({
            model: this.licenseRequestModel,
            attr: 'name',
            classElement: function($el) {
                return $el.parent();
            },
            errorClass: 'error'
        }));
        this.subview('register-company', new Bbind.text({
            model: this.licenseRequestModel,
            attr: 'company',
            classElement: function($el) {
                return $el.parent();
            },
            errorClass: 'error'
        }));
        this.subview('register-country', new Bbind.select({
            model: this.licenseRequestModel,
            attr: 'country',
            classElement: function($el) {
                return $el.parent();
            },
            errorClass: 'error'
        }));
        this.subview('register-email', new Bbind.text({
            model: this.licenseRequestModel,
            attr: 'email',
            classElement: function($el) {
                return $el.parent();
            },
            errorClass: 'error'
        }));
        this.subview('register-phone', new Bbind.text({
            model: this.licenseRequestModel,
            attr: 'phone',
            classElement: function($el) {
                return $el.parent();
            },
            errorClass: 'error'
        }));

        var that = this; //TODO make subview

        var dLicense = $.Deferred();
        this.license = new LicenseModel({});
        this.license.fetch({
            error: function () {
                dLicense.reject();
            }
        });
        this.listenTo(this.license, 'sync', function () {
            dLicense.resolveWith(this.license);
        });

        //that.error = true;

        $.when(dLicense)
            .done(function () {
                that.render();
            })
            .fail(function () {
                that.error = true;
                that.render();
            });
    },

    showLicenseText: function (event) {
        event.preventDefault();

        if (!this.licenseTextModal) {
            this.licenseTextModal = new LicenseTextModal({ model: this.license });
            this.licenseTextModal.addToDOM();
        }
        this.licenseTextModal.launch();
    },

    displayLicenseInfo: function(e) {
        e.preventDefault();

        if (!this.licenseModal) {
            this.licenseModal = new LicenseModal({ model: this.license });
            this.licenseModal.addToDOM();
        }
        this.licenseModal.launch();
    },

    register: function (event) {
        event.preventDefault();
        /*
         var params = {
         name: 'John Smith',
         company: 'Company, Inc.',
         country: 'US',
         email: 'email@email.com',
         phone: '9251234567',
         type: 'trial'
         }
         */
        var params = this.licenseRequestModel.toJSON();

        var ajax;

        // for testing only
        if (this.navFlow.mockState && this.navFlow.mockState.LicenseRegisterView) {
            ajax = $.Deferred();
            console.log(this.navFlow.mockState.LicenseRegisterView.registerResponse);
            if (this.navFlow.mockState.LicenseRegisterView.registerResponse === 'success') {
                ajax.resolve();
            } else if (this.navFlow.mockState.LicenseRegisterView.registerResponse === 'failed') {
                ajax.rejectWith(null, [{
                    status: 400,
                    responseText: '{"message": "mock message"}'
                }]);
            } else if (this.navFlow.mockState.LicenseRegisterView.registerResponse === 'offline') {
                ajax.rejectWith(null, [{
                    status: 504
                }]);
            }
        } else {
            ajax = this.dataSource.requestLicense(params);
        }

        var that = this;

        ajax.done(function () {
                Notifier.success({
                    'title': 'Success',
                    'text': 'Successfully registered.'
                });
                that.navFlow.go('LicenseInfoView');
            })
            .fail(function (jqXHR) {
                if (jqXHR.status === 504) {
                    var response = JSON.parse(jqXHR.responseText);

                    that.navFlow.go('LicenseOfflineView', {
                        prevStateId: 'LicenseRegisterView',
                        licenseRequestBlob: response.licenseRequestBlob
                    });
                } else {
                    var response = JSON.parse(jqXHR.responseText);
                    //TODO parse resonse.message.message for field validation
                    Notifier.error({
                        'title': 'Registration Failed',
                        'text': 'Failed to register. Server response: ' + response.message + '.'
                    });
                }
            });
    },

    upload: function (event) {
        event.preventDefault();

        this.navFlow.go('LicenseUploadView', {
            prevStateId: 'LicenseRegisterView'
        });
    },

    displayLicenseInfo: function(e) {
        e.preventDefault();

        if (!this.licenseModal) {
            this.licenseModal = new LicenseModal({ model: this.license });
            this.licenseModal.addToDOM();
        }
        this.licenseModal.launch();
    },

    render: function() {
        var that = this;
        var html = this.template({
            error: that.error,
            license: that.license,
            countries: countries
        });
        this.$el.html(html);
        if (this.assignments) {
            this.assign(this.assignments);
        }
        return this;
    },

    assignments: {
        '.register-name': 'register-name',
        '.register-company': 'register-company',
        '.register-country': 'register-country',
        '.register-email': 'register-email',
        '.register-phone': 'register-phone'
    }

});
exports = module.exports = LicenseRegisterView;