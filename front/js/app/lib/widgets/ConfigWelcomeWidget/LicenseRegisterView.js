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

        var stateOptions = options.stateOptions;
        this.prevStateId = (stateOptions && stateOptions.prevStateId) ? stateOptions.prevStateId : 'WelcomeView';

        this.licenseRequestModel = new LicenseRequestModel();

        this.listenTo(this.licenseRequestModel, 'change', function (model) {
            var valid = this.licenseRequestModel.isValid();

            if (valid) {
                this.$el.find('.register').removeClass('disabled');
            } else {
                this.$el.find('.register').addClass('disabled');
            }
        });

        this.subview('register-name', new Bbind.text({
            model: this.licenseRequestModel,
            attr: 'name',
            setAnyway: true,
            classElement: function($el) {
                return $el.parent().parent();
            },
            errorEl: '.help-block',
            errorClass: 'error'
        }));
        this.subview('register-company', new Bbind.text({
            model: this.licenseRequestModel,
            attr: 'company',
            setAnyway: true,
            classElement: function($el) {
                return $el.parent().parent();
            },
            errorEl: '.help-block',
            errorClass: 'error'
        }));
        this.subview('register-country', new Bbind.select({
            model: this.licenseRequestModel,
            attr: 'country',
            setAnyway: true,
            classElement: function($el) {
                return $el.parent().parent();
            },
            errorEl: '.help-block',
            errorClass: 'error'
        }));
        this.subview('register-email', new Bbind.text({
            model: this.licenseRequestModel,
            attr: 'email',
            setAnyway: true,
            classElement: function($el) {
                return $el.parent().parent();
            },
            errorEl: '.help-block',
            errorClass: 'error'
        }));
        this.subview('register-phone', new Bbind.text({
            model: this.licenseRequestModel,
            attr: 'phone',
            setAnyway: true,
            classElement: function($el) {
                return $el.parent().parent();
            },
            errorEl: '.help-block',
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

        if (!this.licenseRequestModel.isValid()) {
            return;
        }

        this.$el.find('.loading').show();

        var params = this.licenseRequestModel.toJSON();

        var ajax;

        // for testing only
        if (this.navFlow.mockState && this.navFlow.mockState.LicenseRegisterView) {
            ajax = $.Deferred();
            if (this.navFlow.mockState.LicenseRegisterView.registerResponse === 'success') {
                setTimeout(function () {
                    ajax.resolve();
                }, 3000);
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
                that.navFlow.go('LicenseInfoView', {
                    message: 'Successfully registered.'
                });
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
                    that.registrationErrorMsg = response.message;
                    that.render();
                    //Notifier.error({
                    //    'title': 'Registration Failed',
                    //    'text': 'Failed to register. Server response: ' + response.message + '.'
                    //});
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
        var html = this.template({
            error: this.error,
            prevStateId: this.prevStateId,
            registrationErrorMsg: this.registrationErrorMsg,
            license: this.license,
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