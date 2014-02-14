var Collection = require('./ModeCollection');

describe('ModeCollection.js', function() {
    
    var sandbox, c;

    beforeEach(function() {
        sandbox = sinon.sandbox.create();
        c = new Collection([
            { id: 'test', href: '#test', name: 'Test' },
            { id: 'test2', href: '#test2', name: 'Test2' },
            { id: 'test3', href: '#test3', name: 'Test3' }
        ]);
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('clearActive method', function() {
        
        var m;

        beforeEach(function() {
            m = c.get('test');
            m.set('active', true);            
        });

        it('should make all models have active:false', function() {
            c.clearActive();
            expect(m.get('active')).to.equal(false);
        });

        it('should accept options for setting active', function() {
            var spy = sandbox.spy();
            c.on('change:active', spy);
            c.clearActive({ silent: true });
            expect(spy).not.to.have.been.called;
        });

    });

});