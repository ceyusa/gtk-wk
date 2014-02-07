EXTRA_WARNINGS := -Wextra -ansi -std=c99 -Wno-unused-parameter

DEPS_LIBS := $(shell pkg-config --libs gtk+-3.0 webkit2gtk-3.0 gstreamer-1.0)
DEPS_CFLAGS := $(shell pkg-config --cflags gtk+-3.0 webkit2gtk-3.0 gstreamer-1.0)

CFLAGS := -ggdb -Wall $(EXTRA_WARNINGS)

all:

yt-player: ytplayer.o ytplayer-res.o
yt-player: CFLAGS := $(CFLAGS) $(DEPS_CFLAGS)
yt-player: LIBS := $(LIBS) $(DEPS_LIBS)
binaries += yt-player

facebook: facebook.o
facebook: CFLAGS := $(CFLAGS) $(DEPS_CFLAGS)
facebook: LIBS := $(LIBS) $(DEPS_LIBS)
binaries += facebook

khanacademy: khanacademy.o khanacademy-res.o
khanacademy: CFLAGS := $(CFLAGS) $(DEPS_CFLAGS)
khanacademy: LIBS := $(LIBS) $(DEPS_LIBS)
binaries += khanacademy

wkversion: wkversion.o
wkversion: CFLAGS := $(CFLAGS) $(DEPS_CFLAGS)
wkversion: LIBS := $(LIBS) $(DEPS_LIBS)
binaries += wkversion


all: $(binaries)

$(binaries):
	$(CC) $(LDFLAGS) $(LIBS) -o $@ $^

%.o:: %.c
	$(CC) $(CFLAGS) -o $@ -c $<

ytplayer-res.c: ytplayer.xml
	glib-compile-resources --target=$@ --generate-source $<

khanacademy-res.c: khanacademy.xml
	glib-compile-resources --target=$@ --generate-source $<

clean:
	rm -rf *.o $(binaries) *-res.c
