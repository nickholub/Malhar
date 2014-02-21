var BaseView = require('./StepView');
var LicenseModal = DT.lib.LicenseModal;
var LicenseModel = DT.lib.LicenseModel;
var UploadFilesView = DT.lib.UploadFilesView;
var UploadFiles = DT.lib.UploadFileCollection;
var LicenseTextModal = require('./LicenseTextModalView');

var LicenseStepView = BaseView.extend({

    events: {
        'click .displayLicenseInfo': 'displayLicenseInfo',
        'click .show-license-text': 'showLicenseText'
    },

    initialize: function() {
        BaseView.prototype.initialize.apply(this, arguments);
        this.subview('file-upload', new UploadFilesView({
            collection: new UploadFiles([])
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

    render: function() {
        var that = this;
        var html = this.template({
            error: that.error,
            licenseText: that.licenseText,
            license: that.license
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