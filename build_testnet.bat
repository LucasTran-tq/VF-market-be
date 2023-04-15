ssh -i /Users/anfin/lucas_uit/projects/keypems/vfmarket-3.88.53.215.pem ubuntu@ec2-3-88-53-215.compute-1.amazonaws.com "cd /var/www/html/vfmarket-prod && sudo mv ~/dist.zip . && sudo unzip -o dist.zip && pm2 restart vfmarket && pm2 logs vfmarket"

ssh -i /Users/anfin/lucas_uit/projects/keypems/vfmarket-3.88.53.215.pem ubuntu@3.88.53.215

scp -i /path/key.pem -C dist.zip ubuntu@<remote-ip>:~/ 
scp -i /Users/anfin/lucas_uit/projects/keypems/vfmarket-3.88.53.215.pem -C dist.zip ubuntu@3.88.53.215:~/