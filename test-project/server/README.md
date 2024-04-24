# Running server

On an Ubuntu server you can redirect port 80 to 8080 with:

```sh
iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
```
