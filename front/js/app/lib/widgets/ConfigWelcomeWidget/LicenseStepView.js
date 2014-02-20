var BaseView = require('./StepView');
var UploadFilesView = DT.lib.UploadFilesView;
var UploadFiles = DT.lib.UploadFileCollection;

var LicenseStepView = BaseView.extend({

    initialize: function() {
        BaseView.prototype.initialize.apply(this, arguments);
        this.subview('file-upload', new UploadFilesView({
            collection: new UploadFiles([])
        }));
    },

    assignments: {
        '.file-upload-target': 'file-upload'
    }

});
exports = module.exports = LicenseStepView;