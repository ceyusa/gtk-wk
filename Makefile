EXTRA_WARNINGS := -Wextra -ansi -std=c99 -Wno-unused-parameter

DEPS_LIBS := $(shell pkg-config --libs gtk+-3.0 webkit2gtk-3.0 gstreamer-1.0)
DEPS_CFLAGS := $(shell pkg-config --cflags gtk+-3.0 webkit2gtk-3.0 gstreamer-1.0)

CFLAGS := -ggdb -Wall $(EXTRA_WARNINGS)

yt-player: ytplayer.o ytplayer-res.o
yt-player: CFLAGS := $(CFLAGS) $(DEPS_CFLAGS)
yt-player: LIBS := $(LIBS) $(DEPS_LIBS)
binaries += yt-player

all: $(binaries)

$(binaries):
	$(CC) $(LDFLAGS) $(LIBS) -o $@ $^

%.o:: %.c
	$(CC) $(CFLAGS) -o $@ -c $<

ytplayer-res.c: ytplayer.xml
	glib-compile-resources --target=$@ --generate-source $<

clean:
	rm -rf *.o $(binaries) ytplayer-res.c
