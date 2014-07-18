
/**
 * Module dependencies.
 */

var JSONCov = require('mocha').reporters.JSONCov,
fs = require('fs')

/**
 * Expose `Cobertura`.
 */

exports = module.exports = Cobertura

/**
 * Initialize a new `Cobertura` reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function Cobertura(runner) {
	var jade = require('jade')
	jade.doctypes.cobertura = '<!DOCTYPE coverage SYSTEM "http://cobertura.sourceforge.net/xml/coverage-03.dtd">'
	var file = __dirname + '/templates/cobertura.jade', 
	str = fs.readFileSync(file, 'utf8'), 
	fn = jade.compile(str, { filename: file }), 
	self = this

    var files = [],
        coveredLines = 0,
        totalLines = 0;

	JSONCov.call(this, runner, false)

    runner.on('blanket:fileDone', function(thisTotal, filename){
        thisTotal['filename'] = filename;

        var source = {};
        for (var i = 0; i < thisTotal.source.length; i++) {
            var hits = (thisTotal.data[i] !== null)? thisTotal.data[i] : '',
                num = i+1;
            source[num] = {'coverage': hits};
        }

        thisTotal.source = source;

        coveredLines += thisTotal.hits;
        totalLines += thisTotal.sloc;
        files.push(thisTotal);
    });

	runner.on('end',
        function(){
            self.cov.files = files;
            self.cov.coverage = coveredLines/totalLines * 100;
            self.cov.src = __dirname.split('node_modules')[0]

            process.stdout.write(fn({
                cov: self.cov
            }));

        })
}