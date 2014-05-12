EXTRA_WARNINGS := -Wextra -ansi -std=c99 -Wno-unused-parameter

DEPS_LIBS := $(shell pkg-config --libs webkit2gtk-3.0)
DEPS_CFLAGS := $(shell pkg-config --cflags webkit2gtk-3.0)

CFLAGS := -ggdb -Wall $(EXTRA_WARNINGS)

all:

yt-player: ytplayer.o resources.o
yt-player: CFLAGS := $(CFLAGS) $(DEPS_CFLAGS)
yt-player: LIBS := $(LIBS) $(DEPS_LIBS)
binaries += yt-player

facebook: facebook.o
facebook: CFLAGS := $(CFLAGS) $(DEPS_CFLAGS)
facebook: LIBS := $(LIBS) $(DEPS_LIBS)
binaries += facebook

khanacademy: khanacademy.o resources.o
khanacademy: CFLAGS := $(CFLAGS) $(DEPS_CFLAGS)
khanacademy: LIBS := $(LIBS) $(DEPS_LIBS)
binaries += khanacademy

wkversion: wkversion.o
wkversion: CFLAGS := $(CFLAGS) $(DEPS_CFLAGS)
wkversion: LIBS := $(LIBS) $(DEPS_LIBS)
binaries += wkversion

minibrowser: mb/main.o mb/BrowserMarshal.o mb/BrowserCellRendererVariant.o mb/BrowserDownloadsBar.o mb/BrowserSettingsDialog.o mb/BrowserWindow.o
minibrowser: CFLAGS := $(CFLAGS) $(DEPS_CFLAGS) -DWEBKIT_INJECTED_BUNDLE_PATH=\"/opt/jhbuild/lib/webkit2gtk-3.0/injected-bundle\"
minibrowser: LIBS := $(LIBS) $(DEPS_LIBS)
binaries += minibrowser

uri-scheme: uri-scheme.o resources.o
uri-scheme: CFLAGS := $(CFLAGS) $(DEPS_CFLAGS)
uri-scheme: LIBS := $(LIBS) $(DEPS_LIBS)
binaries += uri-scheme

all: $(binaries)

$(binaries):
	$(CC) $(LDFLAGS) -o $@ $^ $(LIBS)

%.o:: %.c
	$(CC) $(CFLAGS) -o $@ -c $<

resfiles = $(shell glib-compile-resources --generate-dependencies resources.xml)
resources.c: resources.xml $(resfiles)
	glib-compile-resources --target=$@ --generate-source $<

mb/BrowserMarshal.c: mb/browser-marshal.list mb/BrowserMarshal.h
	glib-genmarshal --prefix=browser_marshal $< --body > $@

mb/BrowserMarshal.h: mb/browser-marshal.list
	glib-genmarshal --prefix=browser_marshal $< --header > $@

clean:
	rm -rf *.o mb/*.o $(binaries) *-res.c mb/BrowserMarshal.*
