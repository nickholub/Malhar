var BaseView = require('./StepView');
var LicenseModal = DT.lib.LicenseModal;
var LicenseModel = DT.lib.LicenseModel;
var UploadFilesView = DT.lib.UploadFilesView;
var UploadFiles = DT.lib.UploadFileCollection;

var LicenseStepView = BaseView.extend({

    events: {
        'click .displayLicenseInfo': 'displayLicenseInfo'
    },

    initialize: function() {
        BaseView.prototype.initialize.apply(this, arguments);
        this.subview('file-upload', new UploadFilesView({
            collection: new UploadFiles([])
        }));

        this.error = false;

        var that = this; //TODO make subview

        //var dLicenseText = $.Deferred();
        var dLicenseText = $.ajax({
            url : "license.txt",
            dataType: "text"
        });

        dLicenseText.done(function (data) {
            that.licenseText = data;
        });

        var dLicense = $.Deferred();
        this.license = new LicenseModel({});
        this.license.fetch();
        this.listenTo(this.license, 'sync', function () {
            dLicense.resolveWith(this.license);
        });

        $.when(dLicenseText, dLicense)
            .done(function () {
                that.render();
            })
            .fail(function () {
                that.error = true;
                that.render();
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