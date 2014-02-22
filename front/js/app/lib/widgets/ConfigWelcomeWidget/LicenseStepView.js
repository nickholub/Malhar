var BaseView = require('./StepView');
var LicenseModal = DT.lib.LicenseModal;
var LicenseModel = DT.lib.LicenseModel;
var UploadLicenseView = require('./UploadLicenseView');
var UploadFiles = DT.lib.UploadFileCollection;
var LicenseTextModal = require('./LicenseTextModalView');
var LicenseFileCollection = require('./LicenseFileCollection');
var countries = require('./countries');

var LicenseStepView = BaseView.extend({

    events: {
        'click .displayLicenseInfo': 'displayLicenseInfo',
        'click .show-license-text': 'showLicenseText',
        'click .register': 'register'
    },

    initialize: function(options) {
        BaseView.prototype.initialize.apply(this, arguments);
        this.dataSource = options.dataSource;

        // Set a collection for the jar(s) to be uploaded
        this.filesToUpload = new LicenseFileCollection([], {
        });

        this.subview('file-upload', new UploadLicenseView({
            collection: this.filesToUpload
        }));

        this.error = false;

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

        $.when(dLicense)
            .done(function () {
                that.render();
            })
            .fail(function () {
                that.error = true;
                that.render();
            });
    },

    showLicenseText: function (e) {
        e.preventDefault();

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

    register: function () {
        console.log('register');
        var params = {
            name: 'John Smith',
            company: 'Company, Inc.',
            country: 'US',
            email: 'email@email.com',
            phone: '9251234567',
            type: 'trial'
        }
        this.dataSource.requestLicense(params);
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
        '.file-upload-target': 'file-upload'
    }

});
exports = module.exports = LicenseStepView;