NAME := $(shell basename $(shell git config --get remote.origin.url) | sed 's/\.git//')
BRANCH := $(shell git symbolic-ref --short HEAD 2>/dev/null)
VERSION := $(shell git log -1 --pretty=format:"%H")
FEVERSION := $(shell date +'%Y%m%d%H%M%S')
TMPDIR=edu.envol.vip
RELEASESDIR=releases

default: all

all: pack

test: init
	echo "$(VERSION)" > $(TMPDIR)/VERSION

init: clean
	mkdir -p $(TMPDIR)
pack: init
	echo "$(VERSION)" > $(TMPDIR)/VERSION

	sh online.sh

	(cp -rf server/. $(TMPDIR))

	mkdir -p $(RELEASESDIR)
	tar czf $(RELEASESDIR)/$(TMPDIR).tar.gz $(TMPDIR)/

clean:
	rm -rf $(TMPDIR)
	rm -rf $(RELEASESDIR)

.DEFAULT: all
