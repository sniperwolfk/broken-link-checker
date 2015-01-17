"use strict";
var BrokenLinkChecker = require("../lib");
var utils = require("./utils");

var expect = require("chai").expect;



describe("Public API", function()
{
	// Let internal http lib decide when to give up
	this.timeout(0);
	
	
	
	describe("checkUrl", function()
	{
		it("should pass with a real absolute url", function(done)
		{
			new BrokenLinkChecker().checkUrl("https://google.com", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.equal("https://google.com");
				expect(result.error).to.be.null;
				expect(result.broken).to.be.false;
				done();
			});
		});
		
		
		
		it("should fail with a fake absolute url", function(done)
		{
			new BrokenLinkChecker().checkUrl("http://asdf1234.asdf1234", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.equal("http://asdf1234.asdf1234");
				expect(result.resolvedUrl).to.equal("http://asdf1234.asdf1234");
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.code).to.equal("ENOTFOUND");
				expect(result.broken).to.be.true;
				done();
			});
		});
		
		
		
		it("should fail with an empty url", function(done)
		{
			// Reset to defeault timeout since no request should be made in this test
			this.timeout(2000);
			
			new BrokenLinkChecker().checkUrl("", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.equal("");
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.message).to.equal("invalid url");
				expect(result.broken).to.be.true;
				done();
			});
		});
		
		
		
		it("should pass with an empty url (with options)", function(done)
		{
			new BrokenLinkChecker({site:"http://google.com"}).checkUrl("", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.equal("");
				expect(result.resolvedUrl).to.equal("http://google.com/");
				expect(result.error).to.be.null;
				expect(result.broken).to.be.false;
				done();
			});
		});
	});
	
	
	
	describe("checkHtml", function()
	{
		it("should support a single absolute url", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker().checkHtml('<a href="https://google.com">link</a>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.index] = result;
				},
				complete: function(error)
				{
					if (error !== null)
					{
						done(error);
					}
					else
					{
						expect(results[0].url).to.equal("https://google.com");
						expect(results[0].tagName).to.equal("a");
						expect(results[0].attrName).to.equal("href");
						expect(results[0].tag).to.equal('<a href="https://google.com">');
						expect(results[0].text).to.equal("link");
						expect(results[0].broken).to.be.false;
						expect(results).to.have.length(1);
						done();
					}
				}
			});
		});
		
		
		
		it("should support multiple absolute urls", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker().checkHtml('<a href="https://google.com">link1</a><a href="https://bing.com">link2</a>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.index] = result;
				},
				complete: function(error)
				{
					if (error !== null)
					{
						done(error);
					}
					else
					{
						expect(results[0].url).to.equal("https://google.com");
						expect(results[0].tagName).to.equal("a");
						expect(results[0].attrName).to.equal("href");
						expect(results[0].tag).to.equal('<a href="https://google.com">');
						expect(results[0].text).to.equal("link1");
						expect(results[0].broken).to.be.false;
						
						expect(results[1].url).to.equal("https://bing.com");
						expect(results[1].tagName).to.equal("a");
						expect(results[1].attrName).to.equal("href");
						expect(results[1].tag).to.equal('<a href="https://bing.com">');
						expect(results[1].text).to.equal("link2");
						expect(results[1].broken).to.be.false;
						
						expect(results).to.have.length(2);
						done();
					}
				}
			});
		});
		
		
		
		it("should support elements with redundant url attributes", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker().checkHtml('<a href="https://google.com" href="https://bing.com">link</a>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.index] = result;
				},
				complete: function(error)
				{
					if (error !== null)
					{
						done(error);
					}
					else
					{
						// parse5 1.3.0 ignores redundant attributes
						expect(results[0].url).to.equal("https://google.com");
						expect(results[0].tagName).to.equal("a");
						expect(results[0].attrName).to.equal("href");
						expect(results[0].tag).to.equal('<a href="https://google.com">');
						expect(results[0].text).to.equal("link");
						expect(results[0].broken).to.be.false;
						expect(results).to.have.length(1);
						done();
					}
				}
			});
		});
		
		
		
		it("should support elements with multiple url attributes", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker().checkHtml('<img src="https://google.com" longdesc="https://bing.com"/>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.index] = result;
				},
				complete: function(error)
				{
					if (error !== null)
					{
						done(error);
					}
					else
					{
						expect(results[0].url).to.equal("https://google.com");
						expect(results[0].tagName).to.equal("img");
						expect(results[0].attrName).to.equal("src");
						expect(results[0].tag).to.equal('<img src="https://google.com" longdesc="https://bing.com"/>');
						expect(results[0].text).to.be.null;
						expect(results[0].broken).to.be.false;
						
						expect(results[1].url).to.equal("https://bing.com");
						expect(results[1].tagName).to.equal("img");
						expect(results[1].attrName).to.equal("longdesc");
						expect(results[1].tag).to.equal('<img src="https://google.com" longdesc="https://bing.com"/>');
						expect(results[1].text).to.be.null;
						expect(results[1].broken).to.be.false;
						
						expect(results).to.have.length(2);
						done();
					}
				}
			});
		});
		
		
		
		it("should support nested link elements", function(done)
		{
			// Reset to defeault timeout since no request should be made in this test
			this.timeout(2000);
			
			var results = [];
			
			new BrokenLinkChecker().checkHtml('<a href=""><q cite="">quote</q></a>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.index] = result;
				},
				complete: function(error)
				{
					if (error !== null)
					{
						done(error);
					}
					else
					{
						expect(results[0].url).to.equal("");
						expect(results[0].error).to.be.instanceOf(Error);
						expect(results[0].error.message).to.equal("invalid url");
						expect(results[0].tagName).to.equal("a");
						expect(results[0].attrName).to.equal("href");
						expect(results[0].tag).to.equal('<a href="">');
						expect(results[0].text).to.equal("quote");
						expect(results[0].broken).to.be.true;
						
						expect(results[1].url).to.equal("");
						expect(results[1].error).to.be.instanceOf(Error);
						expect(results[1].error.message).to.equal("invalid url");
						expect(results[1].tagName).to.equal("q");
						expect(results[1].attrName).to.equal("cite");
						expect(results[1].tag).to.equal('<q cite="">');
						expect(results[1].text).to.equal("quote");
						expect(results[1].broken).to.be.true;
						
						expect(results).to.have.length(2);
						done();
					}
				}
			});
		});
	});
	
	
	
	describe("checkHtmlUrl", function()
	{
		it("should work", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker().checkHtmlUrl("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/index.html",
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.index] = result;
				},
				complete: function(error)
				{
					if (error !== null)
					{
						done(error);
					}
					else
					{
						expect(results[0].url).to.equal("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html");
						expect(results[0].tagName).to.equal("a");
						expect(results[0].attrName).to.equal("href");
						expect(results[0].tag).to.equal('<a href="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html">');
						expect(results[0].text).to.equal("link-real");
						expect(results[0].broken).to.be.false;
						
						expect(results[1].url).to.equal("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-fake.html");
						expect(results[1].tagName).to.equal("a");
						expect(results[1].attrName).to.equal("href");
						expect(results[1].tag).to.equal('<a href="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-fake.html">');
						expect(results[1].text).to.equal("link-fake");
						expect(results[1].broken).to.be.true;
						
						expect(results).to.have.length(2);
						done();
					}
				}
			});
		});
	});
});
