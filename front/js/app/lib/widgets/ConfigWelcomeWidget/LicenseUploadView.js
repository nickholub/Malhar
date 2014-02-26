var BaseView = require('./StepView');
var LicenseModal = DT.lib.LicenseModal;
var LicenseModel = DT.lib.LicenseModel;
var UploadLicenseView = require('./UploadLicenseView');
var UploadFiles = DT.lib.UploadFileCollection;
var LicenseTextModal = require('./LicenseTextModalView');
var LicenseFileCollection = require('./LicenseFileCollection');
var countries = require('./countries');
var LicenseRequestModel = require('./LicenseRequestModel');
var Bbind = DT.lib.Bbindings;
var Notifier = DT.lib.Notifier;

var LicenseUploadView = BaseView.extend({

    events: {
        'click .displayLicenseInfo': 'displayLicenseInfo', //TODO
        'click .show-license-text': 'showLicenseText',
        'click .continue': 'continue'
    },

    initialize: function(options) {
        BaseView.prototype.initialize.apply(this, arguments);
        this.dataSource = options.dataSource;
        this.navFlow = options.navFlow;

        var stateOptions = options.stateOptions;
        this.prevStateId = (stateOptions && stateOptions.prevStateId) ? stateOptions.prevStateId : 'WelcomeView';

        // Set a collection for the jar(s) to be uploaded
        this.filesToUpload = new LicenseFileCollection([], {
        });

        this.subview('file-upload', new UploadLicenseView({
            collection: this.filesToUpload
        }));

        var that = this;

        this.listenTo(this.filesToUpload, 'upload_success', function() {
            Notifier.success({
                'title': 'Success',
                'text': 'License File Uploaded'
            });
            //that.error = true;
            //that.render();
            that.navFlow.go('LicenseInfoView');
        });

        this.listenTo(this.filesToUpload, 'upload_error', function (jqXHR) {
            //TODO parse resonse.message.message for field validation
            that.error = true;
            that.render();

            if (false)
            Notifier.error({
                'title': 'License File Upload Failed',
                'text': 'License File Upload Failed. Please upload valid license file.'
            });
        });

        this.error = false;
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

    continue: function (event) {
        event.preventDefault();
    },

    render: function() {
        var html = this.template({
            error: this.error,
            prevStateId: this.prevStateId
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
exports = module.exports = LicenseUploadView;