var BaseView = require('./StepView');
var LicenseModal = DT.lib.LicenseModal;
var LicenseModel = DT.lib.LicenseModel;
var LicenseTextModal = require('./LicenseTextModalView');
var LicenseFileCollection = require('./LicenseFileCollection');
var countries = require('./countries');
var Bbind = DT.lib.Bbindings;
var Notifier = DT.lib.Notifier;

var LicenseInfoView = BaseView.extend({

    events: {
        'click .displayLicenseInfo': 'displayLicenseInfo',
        'click .upload': 'upload',
        'click .go-to-offline': 'goToOffline'
    },

    initialize: function(options) {
        BaseView.prototype.initialize.apply(this, arguments);
        this.dataSource = options.dataSource;
        this.navFlow = options.navFlow;

        this.error = false;
        this.licenseRequestBlob = null;

        var that = this; //TODO make subview

        this.license = new LicenseModel({});
        this.license.fetch({
            error: function () {
                that.error = true;
                that.render();
                //TODO notifier
            }
        });
        this.listenTo(this.license, 'sync', function () {
            //that.render();
            //TODO check if license is default
            if (this.navFlow.mockState) {
                if (this.navFlow.mockState.LicenseInfoView.defaultLicense) {
                    this.license.set('id', 'default-' + this.license.get('id'));
                }
            }

            if (this.license.isDefault()) {
                var ajax = this.dataSource.getLicenseLastRequest();

                ajax.done(function (data) {
                    this.licenseRequestBlob = data.licenseRequestBlob;
                    this.render();
                }.bind(this));

                ajax.fail(function (jqXHR) {
                    if (jqXHR.status === 404) {
                        this.navFlow.go('LicenseRegisterView');
                    } else {
                        //TOOD
                    }
                }.bind(this));
            } else {
                this.render();
            }
        }.bind(this));

        //that.error = true;
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

    upload: function (event) {
        event.preventDefault();

        this.navFlow.go('LicenseUploadView', {
            prevStateId: 'LicenseInfoView'
        });
    },

    goToOffline: function (event) {
        event.preventDefault();

        this.navFlow.go('LicenseOfflineView', {
            prevStateId: 'LicenseInfoView',
            licenseRequestBlob: this.licenseRequestBlob
        });
    },

    render: function() {
        var that = this;
        var html = this.template({
            error: that.error,
            licenseRequestBlob: this.licenseRequestBlob,
            license: that.license
        });
        this.$el.html(html);
        if (this.assignments) {
            this.assign(this.assignments);
        }
        return this;
    },

    assignments: {
    }

});
exports = module.exports = LicenseInfoView;